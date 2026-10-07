# AGENTS.md - NekoFM Project Guidelines & Architecture

## Overview

NekoFM is a middleware of scrobble service like last.fm, listenbrainz. NekoFm will record and process scrobble before commit to service. Meanwhile it provides a dashboard to config and view status.

---

## Tech Stack

- **Runtime & Platform**: [Cloudflare Workers](https://developers.cloudflare.com/workers/) (V8 isolates edge runtime)
- **Web Framework**: [Hono](https://hono.dev/) (`hono` with `hono/jsx` for SSR components)
- **Bundler & Tooling**: [Vite 8](https://vite.dev/) with `@cloudflare/vite-plugin` and `vite-ssr-components`
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/) via `@tailwindcss/vite`
- **Package Manager**: [Bun](https://bun.sh/) (configured with `@jsr:registry=https://npm.jsr.io` via `.npmrc`)
- **Protocol & Ecosystem**: ListenBrainz API to receive scrobble
- **Deployment**: [Wrangler](https://developers.cloudflare.com/workers/wrangler/)

---

## Directory & File Structure

```
nekofm/
├── metadata/                  # Sample payloads, mock data, and test fixtures
│   └── never-gonna-give-you-up.json
├── public/                    # Static assets served directly
├── src/
│   ├── api/                   # API sub-routers and endpoint handlers
│   ├── dashboard/             # Dashboard UI components (Hono JSX)
│   │   └── Dash.tsx
│   ├── types/                 # TypeScript interfaces and type declarations
│   │   ├── listenbrainz.d.ts  # ListenBrainz v1 payload types & schemas
│   │   └── scrobble_schema.d.ts # Internal scrobble & storage schema definitions
│   ├── index.tsx              # Application entry point and router
│   ├── renderer.tsx           # Base HTML layout and SSR wrapper
│   └── style.css              # Global styles & Tailwind CSS entry
├── .npmrc                     # JSR package registry configuration
├── bun.lock                   # Lockfile for Bun package manager
├── package.json               # Dependencies and npm scripts
├── test-api.sh                # cURL test script for API verification
├── tsconfig.json              # TypeScript compiler configuration
├── vite.config.ts             # Vite build configuration
└── wrangler.jsonc             # Cloudflare Workers configuration
```

---

## Workflow & Commands

All commands should preferably be run with `bun`:

| Command | Description |
| :--- | :--- |
| `bun run dev` | Starts the Vite development server with Cloudflare Workers emulation. |
| `bun run build` | Compiles client and worker bundles into `dist/`. |
| `bun run preview` | Builds and runs a local preview of the production bundle. |
| `bun run deploy` | Builds the project and deploys to Cloudflare Workers via Wrangler. |
| `bun run typecheck` | Performs TypeScript static type checking without emitting files. |
| `./test-api.sh` | Executes a sample POST request to test `/api/submit-scrobble`. |

---

## Architectural & Development Conventions

### 1. Edge Runtime Constraints
- The code runs inside Cloudflare Workers isolates.
- Rely solely on standard Web APIs (`fetch`, `Request`, `Response`, `Web Crypto`, `Streams`).
- **Do not** use Node.js-only native modules or APIs (e.g. `fs`, `child_process`) unless supported through Cloudflare polyfills (`node:` compatibility).

### 2. Language & Documentation Rules
- **All code comments, docstrings, commit messages, and documentation must be written in English.**
- Keep comments concise and focused on intent and edge cases.

### 3. Hono & JSX Component Guidelines
- Use Hono JSX (`import { JSX } from "hono/jsx/jsx-runtime"` or automatic JSX transform).
- Components should default to Server-Side Rendering (SSR). Keep components pure and lightweight.
- Global layout is handled in `src/renderer.tsx`. Individual views should be rendered via `c.render(<Component />)`.
- Use Tailwind CSS v4 utility classes for styling. Avoid inline styles.

### 4. API & ListenBrainz Compatibility
- Scrobble ingestion endpoints must adhere to ListenBrainz v1 schemas defined in `src/types/listenbrainz.d.ts`:
  - Support `listen_type`: `"single" | "playing_now" | "import"`.
  - Parse and normalize `track_metadata` (including `artist_name`, `track_name`, `release_name`, and `additional_info`).
  - Gracefully handle MBIDs (`recording_mbid`, `release_mbid`, `artist_mbids`, etc.).
- Structure new API endpoints cleanly by modularizing them in `src/api/` and mounting them on the main app in `src/index.tsx`.

### 5. Type Safety & TypeScript Guidelines
- Maintain strict typing (`strict: true` is configured in `tsconfig.json`).
- Avoid `any`. Use `unknown` with runtime type narrowing or validation where appropriate.
- When bindings (KV, D1, R2, Environment Variables) are added to `wrangler.jsonc`, run `bun run cf-typegen` and pass `CloudflareBindings` to Hono: `new Hono<{ Bindings: CloudflareBindings }>()`.

---

## Agent Verification Checklist

- run `bun run build` to pass build
- frontend pages only have layout and typography, styles should be designed and implemented by uesr manually
## Agent Behaviours

- explain propuse before edit file and run commands

# Further Reading
- see `@agents/docs`
- [ListenBrainz Core API Docs](https://listenbrainz.readthedocs.io/en/latest/users/api/core.html)