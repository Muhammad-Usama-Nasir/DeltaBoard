# Deltaboard

A project change tracker built with Next.js. Each user logs in with Google and manages their own clients, projects, and change requests — fully isolated from other users. Data is stored in Google Sheets as a free backend.

---

## What it does

- Google login — secure, no passwords to manage
- Each user sees only their own projects and clients
- Track change requests per project with title, description, value, and status
- Update change status (Pending → In Progress → Done)
- Summary dashboard showing total projects, pending changes, completed changes, and total value
- Everything adds and edits from the UI — no touching the spreadsheet directly

---

## Tech stack

- **Framework** — Next.js 14 (App Router)
- **Auth** — NextAuth.js v4 with Google OAuth
- **Database** — Google Sheets (via Google Sheets API)
- **Styling** — Tailwind CSS
- **Language** — TypeScript
- **Hosting** — Vercel (free)

---

## Project structure

```
delta-board/
├── app/
│   ├── layout.tsx                  # Root layout + session provider
│   ├── page.tsx                    # Main dashboard
│   ├── globals.css
│   ├── login/
│   │   └── page.tsx                # Google sign-in page
│   └── api/
│       ├── auth/
│       │   └── [...nextauth]/
│       │       └── route.ts        # NextAuth handler
│       ├── projects/
│       │   └── route.ts            # GET, POST, PATCH, DELETE projects
│       └── changes/
│           └── route.ts            # GET, POST, PATCH, DELETE changes
├── components/
│   ├── Providers.tsx               # SessionProvider wrapper
│   ├── ProjectCard.tsx             # Collapsible project card
│   ├── ChangeRow.tsx               # Single change request row
│   └── StatusBadge.tsx             # Pending / In Progress / Done pill
├── lib/
│   ├── auth.ts                     # NextAuth config
│   └── sheets.ts                   # Google Sheets read/write logic
├── types/
│   └── index.ts                    # TypeScript types
├── .env.local                      # Your credentials (never commit this)
└── ...config files
```

---

## Getting started

### Prerequisites

- Node.js 18 or higher
- A Google account
- A Google Cloud project (free)

---

### Step 1 — Clone and install

```bash
git clone https://github.com/your-username/delta-board.git
cd delta-board
npm install
```

---

### Step 2 — Create your Google Sheet

1. Go to [sheets.google.com](https://sheets.google.com) and create a new spreadsheet
2. Name it **Deltaboard**
3. Create two tabs at the bottom — rename them exactly: `Projects` and `Changes`

In the **Projects** tab, add these headers in row 1:

| A | B | C | D | E | F | G |
|---|---|---|---|---|---|---|
| id | name | clientName | startDate | status | notes | ownerEmail |

In the **Changes** tab, add these headers in row 1:

| A | B | C | D | E | F | G | H | I |
|---|---|---|---|---|---|---|---|---|
| id | projectId | title | description | requestedBy | dateRequested | status | value | dateCompleted |

4. Copy your **Sheet ID** from the URL — it is the long string between `/d/` and `/edit`:
```
https://docs.google.com/spreadsheets/d/YOUR_SHEET_ID_IS_HERE/edit
```
You will need this for your `.env.local` file.

---

### Step 3 — Set up Google Cloud

#### 3a — Create a project

1. Go to [console.cloud.google.com](https://console.cloud.google.com)
2. Click the project dropdown at the top → **New Project**
3. Name it `deltaboard` and click **Create**

#### 3b — Enable the Google Sheets API

1. Go to **APIs & Services → Enable APIs and Services**
2. Search for **Google Sheets API** and enable it

#### 3c — Create OAuth credentials (for Google login)

1. Go to **APIs & Services → Credentials → Create Credentials → OAuth 2.0 Client ID**
2. If prompted, configure the OAuth consent screen first:
   - User type: **External**
   - App name: `Deltaboard`
   - Add your email as a test user
3. Back in Credentials, set application type to **Web application**
4. Under **Authorized redirect URIs**, add:
   ```
   http://localhost:3000/api/auth/callback/google
   ```
   > When you deploy to Vercel later, also add your production URL here:
   > `https://your-app.vercel.app/api/auth/callback/google`
5. Click **Create** — copy the **Client ID** and **Client Secret**

#### 3d — Create a Service Account (for Google Sheets access)

1. Go to **APIs & Services → Credentials → Create Credentials → Service Account**
2. Name it `deltaboard-sheets` and click **Done**
3. Click the service account you just created → **Keys tab → Add Key → Create new key → JSON**
4. A JSON file downloads automatically — open it and find these two values:
   ```json
   "client_email": "deltaboard-sheets@your-project.iam.gserviceaccount.com"
   "private_key": "-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
   ```
5. Go back to your Google Sheet → click **Share** → paste the `client_email` → give it **Editor** access

---

### Step 4 — Configure your environment

Create a `.env.local` file in the root of your project and fill in your credentials:

```env
# ─── NextAuth ─────────────────────────────────────────────────────────────────
# The URL your app runs on locally
NEXTAUTH_URL=http://localhost:3000

# A random secret used to encrypt session tokens
# Generate one by running: openssl rand -base64 32
NEXTAUTH_SECRET=paste_your_generated_secret_here

# ─── Google OAuth (from Step 3c) ──────────────────────────────────────────────
GOOGLE_CLIENT_ID=paste_your_oauth_client_id_here
GOOGLE_CLIENT_SECRET=paste_your_oauth_client_secret_here

# ─── Google Sheets (from Step 2 and Step 3d) ──────────────────────────────────
# The ID from your Google Sheet URL
GOOGLE_SHEET_ID=paste_your_sheet_id_here

# From the downloaded service account JSON file
GOOGLE_SERVICE_ACCOUNT_EMAIL=paste_your_service_account_email_here

# Paste the entire private key including the BEGIN and END lines
# Keep the double quotes around it
GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYOUR_KEY_CONTENT_HERE\n-----END PRIVATE KEY-----\n"
```

> **Important** — never commit `.env.local` to Git. It is already in `.gitignore` by default in Next.js projects. Double check this before pushing.

To generate your `NEXTAUTH_SECRET`, run this in your terminal:
```bash
openssl rand -base64 32
```

---

### Step 5 — Run locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) — you will be redirected to the login page. Sign in with Google and your dashboard will load.

---

## Deploying to Vercel

1. Push your code to GitHub (make sure `.env.local` is not committed)
2. Go to [vercel.com](https://vercel.com) and import your GitHub repository
3. In the Vercel project settings → **Environment Variables**, add all the same variables from your `.env.local` file — but change `NEXTAUTH_URL` to your Vercel URL:
   ```
   NEXTAUTH_URL=https://your-app-name.vercel.app
   ```
4. Go back to Google Cloud Console → OAuth credentials → add your Vercel URL to **Authorized redirect URIs**:
   ```
   https://your-app-name.vercel.app/api/auth/callback/google
   ```
5. Deploy — Vercel will build and host it automatically

Share the Vercel URL with your colleagues. They sign in with their own Google accounts and get their own private workspace.

---

## How multi-user isolation works

Every project row in Google Sheets has an `ownerEmail` column that stores the logged-in user's Google email. Every API route reads the session and filters data strictly by that email. This means:

- User A logs in → sees only User A's projects and changes
- User B logs in → sees only User B's projects and changes
- No user can read, edit, or delete another user's data — enforced at the API level

There is no admin role. Everyone has equal access to their own workspace.

---

## Adding a new user

No setup needed. Anyone with a Google account can sign in at your Vercel URL and immediately gets their own empty workspace. Their data is completely separate from yours from the moment they log in.

---

## Environment variables reference

| Variable | Where to get it |
|---|---|
| `NEXTAUTH_URL` | Your app URL (`http://localhost:3000` locally) |
| `NEXTAUTH_SECRET` | Run `openssl rand -base64 32` in your terminal |
| `GOOGLE_CLIENT_ID` | Google Cloud → Credentials → OAuth 2.0 Client ID |
| `GOOGLE_CLIENT_SECRET` | Google Cloud → Credentials → OAuth 2.0 Client Secret |
| `GOOGLE_SHEET_ID` | Your Google Sheet URL between `/d/` and `/edit` |
| `GOOGLE_SERVICE_ACCOUNT_EMAIL` | Downloaded service account JSON → `client_email` |
| `GOOGLE_PRIVATE_KEY` | Downloaded service account JSON → `private_key` |

---

## Common issues

**`CLIENT_FETCH_ERROR` on login page**
NextAuth cannot find its API route. Make sure the folder is named exactly `[...nextauth]` with square brackets and the file inside is `route.ts`.

**`Cannot destructure handlers` error**
You have NextAuth v4 installed but used v5 syntax. Make sure `lib/auth.ts` uses `NextAuthOptions` and exports `authOptions`, not `handlers`.

**Google Sheets returns empty data**
Make sure you shared the Google Sheet with your service account email and gave it Editor access.

**Private key errors on Vercel**
When pasting `GOOGLE_PRIVATE_KEY` into Vercel's environment variables, paste the raw value including the `-----BEGIN PRIVATE KEY-----` lines. Do not wrap it in extra quotes in the Vercel dashboard.

---

## License

MIT
