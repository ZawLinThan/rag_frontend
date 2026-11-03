# Spotify on the focus timer

The timer includes an official Spotify embed and optional account authorization. Paste an `https://open.spotify.com/` playlist, album or track link to load its player. The full Spotify Web Player opens in a separate tab; it is not framed inside the app. Spotify controls playback and account eligibility. Starting, pausing or completing a focus session does not automatically control music.

## Setup

Create a Spotify developer application with Web API access. Configure these **public** frontend values in `.env`:

```dotenv
VITE_SPOTIFY_CLIENT_ID=your_application_client_id
VITE_SPOTIFY_REDIRECT_URI=http://127.0.0.1:5173/spotify/callback
```

Register that exact redirect URI in the Spotify application dashboard. For production use `https://your-app.example/spotify/callback`. The application rejects redirects with a different origin, wildcards, query strings, fragments, or an insecure origin other than `http://127.0.0.1`. Never add a Client Secret to Vite configuration.

For local development start Vite with `npm run dev -- --host 127.0.0.1` and open `http://127.0.0.1:5173`. Configure the backend's `FRONTEND_URL` and Supabase's site/allowed auth redirect URLs for this same origin so the existing workspace sign-in works. Spotify authorization cannot use `http://localhost`. Restart Vite after changing environment variables. Developer-mode access also depends on Spotify's current application/account restrictions and allowed users.

## Authorization and API contract

Source: [Spotify OpenAPI schema](https://developer.spotify.com/reference/web-api/open-api-schema.yaml), inspected for this implementation. The currently-playing read uses non-deprecated `GET https://api.spotify.com/v1/me/player/currently-playing`, with no query parameters and scope `user-read-currently-playing`.

The runtime schema validates the fields used from `OneCurrentlyPlayingTrack` / `CurrentlyPlayingContextObject`: `is_playing`, nullable `item`, and the item's `name`, `uri`, `type`, and optional `artists[].name` and `album.images[].url`. Other response fields are unused. A no-content response is handled as no active playback. The documented 401, 403 and 429 responses are handled explicitly, and other HTTP and network errors receive feedback. Spotify's returned error message is included when present. Ads, null items and unsupported content do not generate embed URLs.

Authorization uses [Authorization Code with PKCE](https://developer.spotify.com/documentation/web-api/tutorials/code-pkce-flow), S256, cryptographically random state, and a one-use verifier. Only the pending verifier/state and ten-minute transaction timestamp use session storage. Access and refresh tokens remain in memory, are cleared on disconnect or app-account change, and are never logged or written to local/session storage. Reloading the app requires reconnecting Spotify. The callback removes authorization parameters from browser history before exchange. No Client Secret is used.

Expired access tokens are refreshed before requests; simultaneous refreshes are coalesced. A 401 triggers one refresh and replay. Refresh-token rotation is supported. `invalid_grant` clears the connection and presents the Connect Spotify action for reauthorization. Authorization is always a user action.

Reads occur sequentially every 10 seconds while the browser document is visible, and stop when the authenticated layout unmounts or Spotify disconnects. HTTP 429 observes `Retry-After` and exponential delays, with bounded retries and a shared cooldown. Long delays are surfaced to the UI and honored before its next poll; no tight retry loop is used.

## Persistent floating player

`SpotifyPanel` is mounted once in the authenticated layout, alongside the route outlet. The timer page no longer owns it. The same iframe remains at the same React/DOM position across route changes; CSS changes between the inline card and draggable floating presentation. Loading another link or closing the player intentionally replaces or removes its playback. A full reload or signing out ends the player session.

The floating view contains only Spotify’s official embed, with a small drag handle. The player supplies its own artwork and playback controls; the app does not add a duplicate artwork card or transport controls. Spotify’s public API does not expose Canvas videos. No playback-modification scope is requested. The expanded connection and link-entry UI remains on the focus timer page.

Dragging uses pointer capture for mouse/touch, arrow keys for keyboard movement, and viewport bounds. The floating timer’s clock icon is its drag handle.

## Content and attribution

The embed retains Spotify's own player, branding and controls. The panel labels metadata as Spotify content and links to Spotify. Response data is used only for the current view; it is not persisted, sent to the RAG backend, or used to train models. An iframe URL is generated only from a validated Spotify hostname and supported content ID. There are no playlist/library API calls or deprecated endpoints.

References: [redirect URIs](https://developer.spotify.com/documentation/web-api/concepts/redirect_uri), [scopes](https://developer.spotify.com/documentation/web-api/concepts/scopes), [refresh](https://developer.spotify.com/documentation/web-api/tutorials/refreshing-tokens), [rate limits](https://developer.spotify.com/documentation/web-api/concepts/rate-limits), [embeds](https://developer.spotify.com/documentation/embeds/tutorials/creating-an-embed), [Developer Terms](https://developer.spotify.com/terms).

## Verification

`npm run test:spotify` covers redirect/link validation, state checks, PKCE parameters, memory-only token handling, refresh coalescing, expired grants, forbidden responses and rate-limit cooldowns. Real authorization and playback require a configured Spotify application and account and must also be checked against Spotify's live service.
