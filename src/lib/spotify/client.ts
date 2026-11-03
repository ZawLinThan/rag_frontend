import { z } from "zod";

// Fields used from OneCurrentlyPlayingTrack / CurrentlyPlayingContextObject and
// TrackObject in Spotify's OpenAPI schema. Do not persist Spotify response data.
const playbackSchema = z.object({
  is_playing: z.boolean().optional(),
  item: z
    .object({
      name: z.string(),
      uri: z.string(),
      type: z.string(),
      artists: z.array(z.object({ name: z.string() })).optional(),
    })
    .nullish(),
});

const tokenSchema = z.object({
  access_token: z.string().min(1),
  token_type: z.string(),
  expires_in: z.number().positive(),
  refresh_token: z.string().optional(),
});

export type Playback = z.infer<typeof playbackSchema>;
export class SpotifyError extends Error {
  status: number;
  retryAt: number;
  constructor(message: string, status = 0, retryAt = 0) {
    super(message);
    this.status = status;
    this.retryAt = retryAt;
  }
}

export function spotifyContent(input: string) {
  const uri = /^spotify:(track|album|playlist):([A-Za-z0-9]{22})$/.exec(
    input.trim(),
  );
  if (uri) return { type: uri[1], id: uri[2] };
  try {
    const url = new URL(input);
    if (
      url.protocol !== "https:" ||
      url.hostname !== "open.spotify.com" ||
      url.username ||
      url.password ||
      url.port
    )
      return null;
    const match =
      /^\/(?:intl-[a-z]+\/)?(track|album|playlist)\/([A-Za-z0-9]{22})\/?$/.exec(
        url.pathname,
      );
    return match ? { type: match[1], id: match[2] } : null;
  } catch {
    return null;
  }
}

export function validateRedirect(value: string, origin: string) {
  const url = new URL(value);
  if (
    url.origin !== origin ||
    url.pathname !== "/spotify/callback" ||
    url.search ||
    url.hash ||
    url.username ||
    url.password ||
    value.includes("*") ||
    !(
      url.protocol === "https:" ||
      (url.protocol === "http:" && url.hostname === "127.0.0.1")
    )
  )
    throw new Error(
      "Use an HTTPS redirect on this app’s origin, or http://127.0.0.1 for local development, ending in /spotify/callback.",
    );
  return url.href;
}

export function retryDelay(
  header: string | null,
  attempt: number,
  now = Date.now(),
) {
  const seconds = header === null ? NaN : Number(header);
  const specified = Number.isFinite(seconds)
    ? Math.max(0, seconds * 1000)
    : Math.max(0, Date.parse(header ?? "") - now) || 0;
  return Math.max(specified, 1000 * 2 ** attempt);
}

const base64url = (bytes: Uint8Array) =>
  btoa(String.fromCharCode(...bytes))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
const transactionKey = "folio.spotify.pkce";

export function createSpotifyClient(
  config: { clientId: string; redirectUri: string },
  transport: typeof fetch = fetch,
) {
  let tokens: { access: string; refresh: string; expires: number } | null =
    null;
  let version = 0;
  let cooldown = 0;
  let refresh: Promise<void> | null = null;
  const listeners = new Set<() => void>();
  const publish = () => listeners.forEach((fn) => fn());
  const disconnect = () => {
    version++;
    tokens = null;
    refresh = null;
    sessionStorage.removeItem(transactionKey);
    publish();
  };
  async function request(url: string, init: RequestInit, signal?: AbortSignal) {
    if (cooldown > Date.now())
      throw new SpotifyError(
        "Spotify is rate limiting requests. Please wait before trying again.",
        429,
        cooldown,
      );
    for (let attempt = 0; ; attempt++) {
      const res = await transport(url, { ...init, signal, cache: "no-store" });
      if (res.status !== 429) return res;
      const delay = retryDelay(res.headers.get("Retry-After"), attempt);
      cooldown = Date.now() + delay;
      // Avoid keeping long requests alive. The UI schedules the next attempt.
      if (attempt >= 2 || delay > 10000)
        throw new SpotifyError(
          "Spotify is busy. We’ll wait before checking again.",
          429,
          cooldown,
        );
      await new Promise<void>((resolve, reject) => {
        const abort = () => {
          clearTimeout(id);
          reject(new DOMException("Aborted", "AbortError"));
        };
        const id = setTimeout(() => {
          signal?.removeEventListener("abort", abort);
          resolve();
        }, delay);
        if (signal?.aborted) abort();
        else signal?.addEventListener("abort", abort, { once: true });
      });
    }
  }
  async function failure(res: Response): Promise<never> {
    const raw = await res.text();
    let body;
    try {
      body = JSON.parse(raw);
    } catch {
      /* Spotify sometimes returns plain-text access errors. */
    }
    const detail =
      typeof body?.error?.message === "string"
        ? body.error.message
        : typeof body?.error_description === "string"
          ? body.error_description
          : typeof body?.error === "string"
            ? body.error
            : !body && !raw.trim().startsWith("<")
              ? raw.trim().slice(0, 500)
              : "";
    if (body?.error === "invalid_grant" || res.status === 401) {
      disconnect();
      throw new SpotifyError(
        `Your Spotify authorization has expired. Connect Spotify again.${detail ? ` ${detail}` : ""}`,
        res.status,
      );
    }
    const fallback =
      res.status === 403
        ? "Spotify denied access (403)."
        : `Spotify request failed (${res.status}). Please try again.`;
    throw new SpotifyError(
      detail ? `${fallback} ${detail}` : fallback,
      res.status,
    );
  }
  async function exchange(
    params: Record<string, string>,
    expectedVersion: number,
  ) {
    const res = await request("https://accounts.spotify.com/api/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({ ...params, client_id: config.clientId }),
    });
    if (!res.ok) return failure(res);
    const data = tokenSchema.parse(await res.json());
    if (expectedVersion !== version)
      throw new Error("Spotify connection was cancelled.");
    const refreshToken = data.refresh_token ?? tokens?.refresh;
    if (!refreshToken || data.token_type.toLowerCase() !== "bearer")
      throw new Error(
        "Spotify returned an invalid authorization response. Connect again.",
      );
    tokens = {
      access: data.access_token,
      refresh: refreshToken,
      expires: Date.now() + data.expires_in * 1000,
    };
    publish();
  }
  async function refreshTokens() {
    if (!tokens)
      throw new SpotifyError("Connect Spotify to see what’s playing.", 401);
    if (!refresh) {
      refresh = exchange(
        { grant_type: "refresh_token", refresh_token: tokens.refresh },
        version,
      ).finally(() => {
        refresh = null;
      });
    }
    await refresh;
  }
  return {
    subscribe(fn: () => void) {
      listeners.add(fn);
      return () => {
        listeners.delete(fn);
      };
    },
    connected: () => tokens !== null,
    disconnect,
    async authorize() {
      if (!config.clientId)
        throw new Error(
          "Spotify sign-in is not configured yet. You can still load a Spotify link below.",
        );
      const redirect = validateRedirect(
        config.redirectUri,
        window.location.origin,
      );
      const verifier = base64url(crypto.getRandomValues(new Uint8Array(64)));
      const state = base64url(crypto.getRandomValues(new Uint8Array(32)));
      const challenge = base64url(
        new Uint8Array(
          await crypto.subtle.digest(
            "SHA-256",
            new TextEncoder().encode(verifier),
          ),
        ),
      );
      sessionStorage.setItem(
        transactionKey,
        JSON.stringify({ verifier, state, created: Date.now(), redirect }),
      );
      const query = new URLSearchParams({
        client_id: config.clientId,
        response_type: "code",
        redirect_uri: redirect,
        scope: "user-read-currently-playing",
        state,
        code_challenge_method: "S256",
        code_challenge: challenge,
      });
      window.location.assign(`https://accounts.spotify.com/authorize?${query}`);
    },
    async callback(search: string) {
      const params = new URLSearchParams(search);
      const saved = sessionStorage.getItem(transactionKey);
      sessionStorage.removeItem(transactionKey);
      const transaction = saved ? JSON.parse(saved) : null;
      if (
        !transaction ||
        params.get("state") !== transaction.state ||
        Date.now() - transaction.created > 600000
      )
        throw new Error(
          "Spotify sign-in could not be verified or has expired. Please connect again.",
        );
      if (params.has("error"))
        throw new Error(
          "Spotify access was declined. You can reconnect from the focus timer.",
        );
      const code = params.get("code");
      if (!code)
        throw new Error(
          "Spotify did not return an authorization code. Please connect again.",
        );
      await exchange(
        {
          grant_type: "authorization_code",
          code,
          redirect_uri: validateRedirect(
            transaction.redirect,
            window.location.origin,
          ),
          code_verifier: transaction.verifier,
        },
        version,
      );
    },
    async currentlyPlaying(signal?: AbortSignal): Promise<Playback | null> {
      const expectedVersion = version;
      if (!tokens || tokens.expires < Date.now() + 60000) await refreshTokens();
      const call = () =>
        request(
          "https://api.spotify.com/v1/me/player/currently-playing",
          { headers: { Authorization: `Bearer ${tokens?.access}` } },
          signal,
        );
      let res = await call();
      if (res.status === 401) {
        await refreshTokens();
        res = await call();
      }
      if (!res.ok) return failure(res);
      if (version !== expectedVersion)
        throw new DOMException("Disconnected", "AbortError");
      // Spotify may return no content when no active playback exists.
      if (res.status === 204) return null;
      return playbackSchema.parse(await res.json());
    },
  };
}
