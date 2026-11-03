import { test, beforeEach } from "node:test";
import assert from "node:assert/strict";
import {
  createSpotifyClient,
  retryDelay,
  spotifyContent,
  validateRedirect,
} from "../src/lib/spotify/client.ts";
const config = {
  clientId: "public-client",
  redirectUri: "http://127.0.0.1:5173/spotify/callback",
};
let storage;
beforeEach(() => {
  storage = new Map();
  globalThis.sessionStorage = {
    getItem: (k) => storage.get(k) ?? null,
    setItem: (k, v) => storage.set(k, v),
    removeItem: (k) => storage.delete(k),
  };
  globalThis.window = {
    location: { origin: "http://127.0.0.1:5173", assign: () => {} },
  };
});
const json = (data, status = 200, headers = {}) =>
  new Response(JSON.stringify(data), { status, headers });
async function login(client) {
  let url;
  window.location.assign = (v) => {
    url = new URL(v);
  };
  await client.authorize();
  assert.equal(url.searchParams.get("scope"), "user-read-currently-playing");
  assert.equal(url.searchParams.get("code_challenge_method"), "S256");
  assert.ok(url.searchParams.get("code_challenge"));
  await client.callback(
    `?code=single-use-code&state=${url.searchParams.get("state")}`,
  );
}
test("only Spotify content URLs and secure exact-origin redirects are accepted", () => {
  assert.deepEqual(
    spotifyContent(
      "https://open.spotify.com/playlist/1234567890123456789012?si=abc",
    ),
    { type: "playlist", id: "1234567890123456789012" },
  );
  for (const link of [
    "https://open.spotify.com.evil.test/track/1234567890123456789012",
    "javascript:alert(1)",
    "https://open.spotify.com/user/example",
    "http://open.spotify.com/track/1234567890123456789012",
  ])
    assert.equal(spotifyContent(link), null);
  assert.equal(
    validateRedirect(config.redirectUri, window.location.origin),
    config.redirectUri,
  );
  for (const value of [
    "http://localhost:5173/spotify/callback",
    "https://evil.test/spotify/callback",
    `${config.redirectUri}?next=evil`,
  ])
    assert.throws(() => validateRedirect(value, window.location.origin));
});
test("PKCE verifies state before exchanging a code and never stores tokens", async () => {
  let calls = 0;
  const client = createSpotifyClient(config, async () => {
    calls++;
    return json({
      access_token: "access",
      refresh_token: "refresh",
      token_type: "Bearer",
      expires_in: 3600,
    });
  });
  await client.authorize();
  await assert.rejects(client.callback("?code=code&state=wrong"), /verified/);
  assert.equal(calls, 0);
  await login(client);
  assert.equal(client.connected(), true);
  assert.equal(storage.size, 0);
  client.disconnect();
  assert.equal(client.connected(), false);
});
test("an expired access token is refreshed once for concurrent reads, retaining the refresh token if not rotated", async () => {
  let refreshes = 0;
  const client = createSpotifyClient(config, async (url, init) => {
    if (url.includes("/api/token")) {
      if (init.body.get("grant_type") === "refresh_token") {
        refreshes++;
        assert.equal(init.body.get("refresh_token"), "refresh");
        return json({
          access_token: "new",
          token_type: "Bearer",
          expires_in: 3600,
        });
      }
      return json({
        access_token: "old",
        refresh_token: "refresh",
        token_type: "Bearer",
        expires_in: 1,
      });
    }
    assert.equal(init.headers.Authorization, "Bearer new");
    return new Response(null, { status: 204 });
  });
  await login(client);
  assert.deepEqual(
    await Promise.all([client.currentlyPlaying(), client.currentlyPlaying()]),
    [null, null],
  );
  assert.equal(refreshes, 1);
});
test("revoked refresh tokens clear the session and require authorization again", async () => {
  const client = createSpotifyClient(config, async (_url, init) =>
    init.body.get("grant_type") === "refresh_token"
      ? json(
          { error: "invalid_grant", error_description: "Refresh revoked" },
          400,
        )
      : json({
          access_token: "old",
          refresh_token: "refresh",
          token_type: "Bearer",
          expires_in: 1,
        }),
  );
  await login(client);
  await assert.rejects(client.currentlyPlaying(), /Connect Spotify again/);
  assert.equal(client.connected(), false);
});
test("429 obeys Retry-After and prevents subsequent calls during cooldown", async () => {
  let reads = 0;
  const client = createSpotifyClient(config, async (url) =>
    url.includes("/api/token")
      ? json({
          access_token: "access",
          refresh_token: "refresh",
          token_type: "Bearer",
          expires_in: 3600,
        })
      : (reads++,
        json({ error: { status: 429, message: "Slow down" } }, 429, {
          "Retry-After": "120",
        })),
  );
  await login(client);
  await assert.rejects(
    client.currentlyPlaying(),
    (error) => error.status === 429 && error.retryAt > Date.now(),
  );
  await assert.rejects(
    client.currentlyPlaying(),
    (error) => error.status === 429,
  );
  assert.equal(reads, 1);
  assert.equal(retryDelay(null, 3), 8000);
  assert.equal(retryDelay("30", 0), 30000);
});
test("403 includes Spotify’s response message and does not retry", async () => {
  let reads = 0;
  const client = createSpotifyClient(config, async (url) =>
    url.includes("/api/token")
      ? json({
          access_token: "access",
          refresh_token: "refresh",
          token_type: "Bearer",
          expires_in: 3600,
        })
      : (reads++,
        json(
          { error: { status: 403, message: "User is not registered" } },
          403,
        )),
  );
  await login(client);
  await assert.rejects(client.currentlyPlaying(), /User is not registered/);
  assert.equal(reads, 1);
});

test("plain-text Spotify 403 errors retain the service detail", async () => {
  const client = createSpotifyClient(config, async (url) =>
    url.includes("/api/token")
      ? json({
          access_token: "access",
          refresh_token: "refresh",
          token_type: "Bearer",
          expires_in: 3600,
        })
      : new Response("User may not be registered", { status: 403 }),
  );
  await login(client);
  await assert.rejects(
    client.currentlyPlaying(),
    (error) =>
      error.status === 403 && /User may not be registered/.test(error.message),
  );
});
