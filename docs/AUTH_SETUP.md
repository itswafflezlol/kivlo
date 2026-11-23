# Auth setup

Kivlo sign-in is currently demo-grade and fully client-side. It will move to Supabase Auth when the backend lands.

## Google sign-in

1. Go to Google Cloud Console → APIs & Services → Credentials.
2. Create a project (e.g. "Kivlo") if you don't have one.
3. Configure the OAuth consent screen first: External, app name **Kivlo**, your support email, scopes `email`, `profile`, `openid`. While the app is in "testing" mode, add your own Gmail under **Test users**.
4. Back in Credentials → Create credentials → **OAuth client ID** → Application type: **Web application**.
5. Under **Authorized JavaScript origins** add:
   - `https://itswafflezlol.github.io`
   - `http://localhost:3000`
   (no redirect URIs needed — we use the token client, not the code flow)
6. Copy the client ID (looks like `12345-abc.apps.googleusercontent.com`).
7. Add it in GitHub → repo **Settings → Secrets and variables → Actions → Variables** (Variables tab, not Secrets — the client ID is public by design, no secret is involved):
   - `GOOGLE_CLIENT_ID` = the client ID
8. For local dev, put the same value in `src/web/.env.local`:
   `NEXT_PUBLIC_GOOGLE_CLIENT_ID=your-client-id`
9. If the variable is empty, the site shows "Google sign-in isn't set up yet." with a demo-mode fallback, so nothing blocks shipping.

## Apple sign-in (later — needs an Apple Developer account, $99/yr)

1. Enroll in the Apple Developer Program.
2. Identifiers → create an **App ID**, then a **Services ID** (e.g. `app.kivlo.web`).
3. Configure the Services ID: domain `itswafflezlol.github.io`, return URL `https://itswafflezlol.github.io/kivlo/login/`.
4. Add `APPLE_SERVICE_ID` = the Services ID to GitHub → Variables (same place as above).
5. Until then the button shows "Apple sign-in is coming soon."

## How it works now

- Google: GIS token client → fetches `/oauth2/v3/userinfo` → stores a tiny demo session (`kivlo.session` in localStorage: name, email, picture, provider). The access token is used once and discarded — never stored.
- Apple: JS API popup → decodes the id_token payload for the email.
- Email/password: creates a demo session locally.
