# Resume Builder — API server

A MERN-stack backend (MongoDB + Express + Node, paired with the existing
React frontend) for the resume builder: accounts, saved resumes, PDF export,
and Claude-powered ATS analysis.

## Setup

You need a MongoDB instance — either local or a free
[MongoDB Atlas](https://www.mongodb.com/cloud/atlas/register) cluster.

**Local MongoDB (macOS example):**
```bash
brew tap mongodb/brew
brew install mongodb-community
brew services start mongodb-community
```
(See mongodb.com for Linux/Windows install instructions.)

**Then:**
```bash
cd server
npm install
cp .env.example .env   # fill in MONGODB_URI, JWT_SECRET, ANTHROPIC_API_KEY
npm run dev            # http://localhost:4000
```

`ANTHROPIC_API_KEY` is only required for the two `/api/ai/*` routes. Every
other route works without it.

> **Note on testing:** I couldn't run a live MongoDB instance in the sandbox
> this was built in (no `mongod` binary available, network-restricted), so
> this version is code-reviewed and syntax-checked but not exercised against
> a real database the way the SQLite version was. Run through the register →
> login → create resume → export PDF flow once locally before trusting it in
> production.

## Auth

All `/api/resumes/*` and `/api/ai/*` routes require a bearer token from
`/api/auth/login` or `/api/auth/register`:

```
Authorization: Bearer <token>
```

| Method | Route              | Body                              |
|--------|--------------------|------------------------------------|
| POST   | `/api/auth/register` | `{ name, email, password }`      |
| POST   | `/api/auth/login`    | `{ email, password }`            |
| GET    | `/api/auth/me`       | —                                  |

## Resumes

| Method | Route                        | Notes                          |
|--------|------------------------------|---------------------------------|
| GET    | `/api/resumes`               | List the signed-in user's resumes |
| POST   | `/api/resumes`               | `{ title?, data }`             |
| GET    | `/api/resumes/:id`           | Owner only                     |
| PUT    | `/api/resumes/:id`           | `{ title?, data? }`            |
| DELETE | `/api/resumes/:id`           | Owner only                     |
| GET    | `/api/resumes/:id/export.pdf`| Streams a formatted PDF        |

`data` shape:

```json
{
  "fullName": "Jane Doe",
  "title": "Senior Product Designer",
  "email": "jane@example.com",
  "phone": "555-0100",
  "location": "Austin, TX",
  "summary": "...",
  "experience": [
    { "company": "Acme Co", "role": "Senior Product Designer", "start": "2021", "end": "Present", "bullets": ["..."] }
  ],
  "education": [
    { "school": "UT Austin", "degree": "BFA Design", "start": "2013", "end": "2017" }
  ],
  "skills": ["Figma", "Design Systems"]
}
```

## AI

| Method | Route                  | Body                                       |
|--------|------------------------|---------------------------------------------|
| POST   | `/api/ai/analyze`      | `{ resumeData, jobDescription }` → `{ score, matchedKeywords, missingKeywords, suggestions }` |
| POST   | `/api/ai/improve-bullet` | `{ text, role? }` → `{ improved }`         |

Both call the Claude API server-side with your `ANTHROPIC_API_KEY` — the key
never reaches the browser.

## Wiring up the frontend

The frontend currently runs on local/mock state. To connect it:

1. Point requests at `http://localhost:4000/api` (or your deployed URL) —
   e.g. add `VITE_API_URL` to the frontend's env and a small `fetch` wrapper
   that attaches the stored JWT.
2. Store the token from `/api/auth/login` (e.g. in memory + a secure cookie,
   or `sessionStorage` if that's acceptable for your deployment).
3. Swap the builder's local "save" and "export" actions for calls to
   `POST /api/resumes` and `GET /api/resumes/:id/export.pdf`.

This is intentionally left for you to wire in, since it touches state
management choices in `builder.tsx` that are easy to get wrong without
seeing how you want autosave/undo to behave.
