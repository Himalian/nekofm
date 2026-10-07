# AGENTS.md - NekoFM Project Guidelines & Architecture

## Overview

NekoFM is a middleware of scrobble service like last.fm, listenbrainz. NekoFm will record and process scrobble before commit to service. Meanwhile it provides a dashboard to config and view status.

---

## Tech Stack

- **Runtime & Platform**: [Cloudflare Workers](https://developers.cloudflare.com/workers/) (V8 isolates edge runtime) with [Workers Static Assets](https://developers.cloudflare.com/workers/static-assets/)
- **Backend Framework**: [Hono](https://hono.dev/) (pure REST/JSON API router on Cloudflare Workers)
- **Frontend Framework**: [React 19](https://react.dev/) (Single Page Application mounted via `index.html`)
- **Bundler & Tooling**: [Vite 8](https://vite.dev/) with `@cloudflare/vite-plugin` and `@vitejs/plugin-react`
- **Styling & UI**: [Tailwind CSS v4](https://tailwindcss.com/) via `@tailwindcss/vite` and [Lucide React](https://lucide.dev/) icons
- **Package Manager**: [Bun](https://bun.sh/) (configured with `@jsr:registry=https://npm.jsr.io` via `.npmrc`)
- **Protocol & Ecosystem**: ListenBrainz API v1 compatible scrobble ingestion
- **Deployment**: [Wrangler](https://developers.cloudflare.com/workers/wrangler/)

---

## Directory & File Structure

```
nekofm/
├── metadata/                  # Sample payloads, mock data, and test fixtures
│   └── never-gonna-give-you-up.json
├── public/                    # Static assets served directly
├── src/
│   ├── api/                   # Backend API sub-routers (listenbrainz, token, nowPlaying, rules, history)
│   ├── client/                # React 19 Frontend SPA
│   │   ├── pages/             # Dashboard feature views (StatusPage, TokenPage, RulesPage)
│   │   ├── services/          # Frontend API fetch services (api.ts)
│   │   ├── App.tsx            # Main application shell with tab navigation
│   │   └── main.tsx           # React root mounting point
│   ├── services/              # Backend business & KV storage services (storage.ts)
│   ├── types/                 # TypeScript interfaces and type declarations
│   │   ├── listenbrainz.d.ts  # ListenBrainz v1 payload types & schemas
│   │   └── scrobble_schema.d.ts # Internal scrobble & storage schema definitions
│   ├── index.ts               # Cloudflare Worker backend entry point & router
│   └── style.css              # Global Tailwind CSS entry
├── .npmrc                     # JSR package registry configuration
├── bun.lock                   # Lockfile for Bun package manager
├── index.html                 # Root HTML entry for React SPA
├── package.json               # Dependencies and npm scripts
├── test-api.sh                # cURL test script for API verification
├── tsconfig.json              # TypeScript compiler configuration
├── vite.config.ts             # Vite build configuration (Workers + React)
└── wrangler.jsonc             # Cloudflare Workers & Static Assets configuration
```

---

## Workflow & Commands

All commands should preferably be run with `bun`:

| Command | Description |
| :--- | :--- |
| `bun run dev` | Starts the Vite development server with Cloudflare Workers emulation and React HMR. |
| `bun run build` | Compiles client SPA (`dist/client`) and worker bundle (`dist/nekofm`). |
| `bun run preview` | Builds and runs a local preview of the production bundle. |
| `bun run deploy` | Builds the project and deploys to Cloudflare Workers via Wrangler. |
| `bun run typecheck` | Performs TypeScript static type checking without emitting files. |
| `./test-api.sh` | Executes a sample POST request to test `/api/listenbrainz/1/submit-listens`. |

---

## Architectural & Development Conventions

### 1. Edge Runtime Constraints
- Backend code runs inside Cloudflare Workers isolates.
- Rely solely on standard Web APIs (`fetch`, `Request`, `Response`, `Web Crypto`, `Streams`).
- **Do not** use Node.js-only native modules or APIs (e.g. `fs`, `child_process`) unless supported through Cloudflare polyfills (`node:` compatibility).

### 2. Language & Documentation Rules
- **All code comments, docstrings, commit messages, and documentation must be written in English.**
- Keep comments concise and focused on intent and edge cases.

### 3. Frontend & React SPA Guidelines
- The dashboard is a decoupled React 19 SPA located in `src/client/`.
- Mounted onto `#root` via `index.html` and `src/client/main.tsx`.
- Cloudflare Workers Static Assets hosts the client bundle, with `assets: { "not_found_handling": "single-page-application" }` configured in `wrangler.jsonc` for client routing.
- Dashboard views are organized by feature area under `src/client/pages/`:
  - `StatusPage.tsx`: Live Now Playing monitor (auto polling) & recent scrobble timeline.
  - `TokenPage.tsx`: Ingestion token management, clipboard copy, and upstream service bindings.
  - `RulesPage.tsx`: Scrobble rule engine configuration and interactive testing sandbox.
- Use Tailwind CSS v4 utility classes and Lucide React icons for UI styling.

### 4. API & ListenBrainz Compatibility
- Scrobble ingestion endpoints must adhere to ListenBrainz v1 schemas defined in `src/types/listenbrainz.d.ts`:
  - Support `listen_type`: `"single" | "playing_now" | "import"`.
  - Parse and normalize `track_metadata` (including `artist_name`, `track_name`, `release_name`, and `additional_info`).
  - Gracefully handle MBIDs (`recording_mbid`, `release_mbid`, `artist_mbids`, etc.).
- Structure backend API endpoints cleanly by modularizing them in `src/api/` and mounting them on the main router in `src/index.ts`.
- Backend endpoints return pure JSON (`c.json(...)`).

### 5. Type Safety & TypeScript Guidelines
- Maintain strict typing (`strict: true` is configured in `tsconfig.json`).
- Avoid `any`. Use `unknown` with runtime type narrowing or validation where appropriate.
- When bindings (KV, D1, R2, Environment Variables) are added to `wrangler.jsonc`, run `bun run cf-typegen` and pass `CloudflareBindings` to Hono: `new Hono<{ Bindings: CloudflareBindings }>()`.

---

## Agent Verification Checklist

- only run `bun run build` after complete a task to pass build
- frontend pages only have layout and typography, styles should be designed and implemented by user manually

## Agent Behaviours

- explain purpose before edit file and run commands

# Further Reading
- see `@agents/docs`
- [ListenBrainz Core API Docs](https://listenbrainz.readthedocs.io/en/latest/users/api/core.html)