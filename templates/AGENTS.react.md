# {{PROJECT_NAME}}

<!-- AGENTS.md: instructions for AI coding agents (Claude Code, Codex, Cursor, Copilot).
     Keep under 150 lines. Replace every TODO, then delete this comment. -->

## Overview

TODO: 2–3 lines — what the product is, who it is for, which platforms (web / mobile web / PWA).

## Tech stack

- React 18 + TypeScript, built with Vite
- Routing: React Router
- State: TODO (Redux Toolkit / Zustand / Context)
- Data fetching: TODO (React Query / RTK Query / axios hooks)
- Styling: TODO (SCSS modules / Tailwind / MUI)
- Testing: Vitest + React Testing Library + MSW
- Lint/format: ESLint (flat config) + Prettier, enforced by Husky + lint-staged

## Commands

```bash
npm install          # install
npm run dev          # start dev server
npm run build        # production build
npm run lint         # ESLint
npm run format       # Prettier write
npm run typecheck    # tsc --noEmit
npm test             # Vitest (run once)
```

## Project structure

```text
src/
├── api/          # configured HTTP client + interceptors
├── services/     # one file per backend resource, typed functions
├── hooks/        # reusable hooks (data hooks wrap services)
├── components/   # shared UI components (one folder per component)
├── pages/        # route-level screens
├── store/        # global state
├── types/        # shared TypeScript types
├── utils/        # pure helpers
└── test/         # test setup and MSW handlers
```

## Conventions

- Components: function components, named exports, `<Name>Props` interface, folder per component with `index.ts`, test next to the file.
- Components never call the HTTP client directly: component → hook → service → `api/client.ts`.
- Every async UI handles loading, error and empty states.
- Env variables start with `VITE_` and are listed in `.env.example`.
- Absolute imports via `@/` alias.
- Commits follow Conventional Commits (`feat(scope): …`).

## Testing

- New components, hooks and services need tests. Query by role/label, interact with `userEvent`, mock network with MSW.
- Bug fixes include a test that fails before the fix.

## Do not

- Do not use `any`; define a type in `src/types/`.
- Do not add new dependencies without saying why in the PR.
- Do not edit `dist/`, generated API clients, or `package-lock.json` by hand.
- Do not commit secrets or `.env` files.

## Definition of done

`npm run lint`, `npm run typecheck` and `npm test` pass, and the change works in the browser.
