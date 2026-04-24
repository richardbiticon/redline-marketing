# Red Line Marketing

Dark, automotive-themed marketing site for Red Line Marketing (React + Vite + framer-motion, deployed on Vercel).

## Local development

```bash
npm install
npm run dev           # Vite only (frontend). API calls fall back to localStorage.
```

To run the API locally too, use Vercel CLI:

```bash
npm i -g vercel
vercel link           # once
vercel dev            # serves both frontend and /api/*
```

## Booking system

Lives at [/book](http://localhost:5173/book) in dev.

### Architecture

- **Frontend:** `src/App.jsx` → `BookPage` component + 4 steps + success screen
- **API:** `/api/bookings.js` (POST), `/api/availability.js` (GET)
- **DB:** Vercel Postgres (via `@vercel/postgres`), schema auto-created on first request
- **Email:** Resend — customer confirmation with `.ics` + team notification
- **Rate limit:** per-IP in-memory, 5 bookings/hour

### Graceful fallback

If `POSTGRES_URL` isn't set, the API uses an in-memory store (per serverless cold
start) so the app boots without any env vars. If the frontend can't reach `/api/*`
(e.g. running `npm run dev` without `vercel dev`), it falls back to `localStorage`.

## Phase 2 setup checklist

To enable real bookings in production, set these up in order:

### 1. Vercel Postgres (required for persistence)

1. Go to your Vercel project → **Storage** → **Create** → **Postgres**
2. Name it (e.g. `redline-bookings`), pick a region close to your users
3. Click **Connect Project** — this automatically adds `POSTGRES_URL` and related env vars
4. Redeploy. The `bookings` table is created automatically on first API request.

### 2. Resend email (required for confirmations)

1. Sign up at [resend.com](https://resend.com) (free tier: 3,000 emails/month)
2. **API Keys** → **Create API Key** → copy the `re_…` value
3. In Vercel → project → **Settings** → **Environment Variables**, add:
   - `RESEND_API_KEY` = `re_…`
   - `BOOKING_NOTIFY` = `richard95biticcon@gmail.com` *(already defaulted in code, override if you want a different recipient)*
4. *(Optional, recommended when ready)* Add a custom sending domain in Resend, verify DNS, then set:
   - `BOOKING_FROM` = `Red Line Marketing <hello@redlinemarketing.ph>`
5. Until you verify a domain, emails ship from Resend's sandbox `onboarding@resend.dev` — fine for testing, may land in spam.

### 3. Test the flow

After the env vars are set and the project redeploys:

1. Visit `/book` on the live URL
2. Walk through all 4 steps and confirm a booking
3. Expect two emails:
   - A branded confirmation at the address you used
   - A plain notification at `richard95biticcon@gmail.com`
4. Try to book the same slot again — you should see "That slot was just taken."

## Environment variables

| Var | Required | Default | Purpose |
| --- | --- | --- | --- |
| `POSTGRES_URL` | Auto-set by Vercel Postgres | — | Database connection |
| `RESEND_API_KEY` | For emails | — | Send customer + team mail |
| `BOOKING_FROM` | No | `Red Line Marketing <onboarding@resend.dev>` | Sender identity |
| `BOOKING_NOTIFY` | No | `richard95biticcon@gmail.com` | Team notification recipient |

## Deferred (Phase 2.4+)

- Cal.com / Google Calendar sync for real team availability
- Reschedule / cancel via magic-link page
- Admin dashboard at `/admin/bookings`
- Cloudflare Turnstile on submit (currently IP-based rate limit only)
- Upgrade rate limit from in-memory to Vercel KV when we see real traffic
