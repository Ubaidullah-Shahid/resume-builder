# Resume Builder — running it in VS Code

This project has two independent apps:

```
resume-builder/
├── src/            ← frontend (Vite + React), runs on :5173
├── server/         ← backend (Express + MongoDB), runs on :4000
```

They run as two separate processes. You'll use two integrated terminals.

## 0. Prerequisites

- **Node.js 18+** — check with `node -v`. Install from nodejs.org if needed.
- **MongoDB** — either:
  - Local install ([macOS](https://www.mongodb.com/docs/manual/tutorial/install-mongodb-on-os-x/) / [Windows](https://www.mongodb.com/docs/manual/tutorial/install-mongodb-on-windows/) / [Linux](https://www.mongodb.com/docs/manual/administration/install-on-linux/)), or
  - A free [MongoDB Atlas](https://www.mongodb.com/cloud/atlas/register) cluster (no local install — just a connection string)
- (Recommended) the **ESLint** and **Tailwind CSS IntelliSense** VS Code extensions

## 1. Open the project

`File → Open Folder…` → select the `resume-builder` folder (the one containing this README). Opening the whole folder, not just `src` or `server`, lets VS Code's integrated terminal and file explorer see both apps at once.

## 2. Install dependencies

Open a terminal in VS Code: `` Ctrl+` `` (or `Terminal → New Terminal`).

```bash
# Terminal 1 — frontend deps
npm install

# Terminal 2 — backend deps (click the "+" in the terminal panel to split)
cd server
npm install
```

## 3. Configure the backend

Still in the `server` terminal:

```bash
cp .env.example .env
```

Open the new `server/.env` file and fill in:
- `MONGODB_URI` — `mongodb://127.0.0.1:27017/resume-builder` for local Mongo, or your Atlas connection string
- `JWT_SECRET` — any long random string
- `ANTHROPIC_API_KEY` — only needed for the AI scoring/rewrite features; leave the placeholder if you're not using those yet

## 4. Run both apps

**Terminal 1 (repo root):**
```bash
npm run dev
```
Frontend is now at **http://localhost:5173**

**Terminal 2 (`server/`):**
```bash
npm run dev
```
API is now at **http://localhost:4000** — check `http://localhost:4000/api/health`, it should return `{"ok":true,"mongo":"connected"}`. If `mongo` says `"disconnected"`, MongoDB isn't reachable — check `MONGODB_URI` or that your local `mongod` is actually running.

Leave both terminals running while you work. Vite hot-reloads the frontend on save; the backend uses `node --watch` so it restarts on save too.

## 5. Debugging in VS Code (optional)

To set breakpoints in the backend instead of reading console logs, add `.vscode/launch.json`:

```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "type": "node",
      "request": "launch",
      "name": "Debug API server",
      "runtimeExecutable": "npm",
      "runtimeArgs": ["run", "dev"],
      "cwd": "${workspaceFolder}/server",
      "console": "integratedTerminal"
    }
  ]
}
```
Then use the Run and Debug panel (`Ctrl+Shift+D`) → "Debug API server" → ▶. Click in the gutter next to any line in a `server/src/**/*.js` file to set a breakpoint.

## Notes

- The frontend and backend aren't wired together yet — the builder currently keeps everything in local component state rather than calling the API. See `server/README.md` for the endpoints available when you're ready to connect them.
- If `npm run build` in the root folder ever fails with a huge unresolved-dependency error, that means something reintroduced a Replit-only `catalog:`/`workspace:*` package reference — this copy's `package.json` has been de-Replit-ified and should install with plain `npm install` anywhere.
