# {{PROJECT_NAME}}

<!-- AGENTS.md: instructions for AI coding agents (Claude Code, Codex, Cursor, Copilot).
     Keep under 150 lines. Replace every TODO, then delete this comment. -->

## Overview

TODO: 2–3 lines — what the product is, who it is for, SEO / SSR needs.

## Tech stack

- Next.js (App Router) + React + TypeScript <!-- ts -->
- Next.js (App Router) + React + JavaScript (JSX) <!-- js -->
- State: TODO (Zustand / Redux Toolkit / Context)
- Data fetching: Server Components + `fetch` for server data; TODO (React Query / SWR) on the client
- Styling: TODO (Tailwind / SCSS modules)
- Testing: Vitest (or Jest) + React Testing Library + MSW; TODO Playwright for E2E
- Lint/format: `eslint-config-next` + Prettier, Husky + lint-staged

## Commands

```bash
npm install
npm run dev
npm run build
npm run lint
npm run format
npm run typecheck <!-- ts -->
npm test
```

## Project structure

```text
app/              # routes: page.tsx, layout.tsx, loading.tsx, error.tsx, route.ts <!-- ts -->
app/              # routes: page.jsx, layout.jsx, loading.jsx, error.jsx, route.js <!-- js -->
components/       # shared UI (one folder per component)
lib/              # server utilities, API client, auth helpers
services/         # typed functions per backend resource
hooks/            # client hooks
types/ <!-- ts -->
public/
```

## Conventions

- TypeScript only: all source files are `.ts`/`.tsx`. <!-- ts -->
- JavaScript project: source files are `.js`/`.jsx`. Migrating to TypeScript is a separate, planned task, not part of feature work. <!-- js -->
- Server Components by default; add `'use client'` only for state, effects, or browser APIs — and keep client components small and low in the tree.
- Fetch data in Server Components or route handlers; set caching explicitly (`cache`, `revalidate`).
- Every route segment that loads data has `loading.tsx` and `error.tsx`.
- Use `next/image` and `next/link`; set `metadata` for every page.
- Public env vars start with `NEXT_PUBLIC_`; secrets are server-only and never imported into client components.
- Commits follow Conventional Commits.

## Testing

- Components, hooks, services and route handlers get unit tests; critical flows (login, checkout) get E2E tests.

## Do not

- Do not use `any`. <!-- ts -->
- Do not leave props or API responses undocumented; describe them with JSDoc `@typedef`. <!-- js -->
- Do not access `window`/`localStorage` in Server Components.
- Do not edit `.next/` or generated files.
- Do not commit secrets or `.env*.local`.

## Definition of done

`npm run lint`, `npm run typecheck`, `npm test` and `npm run build` pass. <!-- ts -->
`npm run lint`, `npm test` and `npm run build` pass. <!-- js -->
