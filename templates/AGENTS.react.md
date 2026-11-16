# {{PROJECT_NAME}}

<!-- AGENTS.md: instructions for AI coding agents (Claude Code, Codex, Cursor, Copilot).
     Keep under 150 lines. Replace every TODO, then delete this comment. -->

## Overview

TODO: 2–3 lines — what the product is, who it is for, which platforms (web / mobile web / PWA).

## Tech stack

- React 18 + TypeScript, built with Vite <!-- ts -->
- React 18 + JavaScript (JSX), built with Vite <!-- js -->
- Routing: React Router
- State: Redux Toolkit (`src/store/`, typed `useAppSelector` / `useAppDispatch`) for global client state
- Data fetching: TanStack React Query for all API data (hooks in `src/hooks/` wrap `src/services/`)
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
npm run typecheck    # tsc --noEmit <!-- ts -->
npm test             # Vitest (run once)
```

## Project structure

```text
src/
├── api/          # configured HTTP client + interceptors
├── services/     # one file per backend resource, typed functions <!-- ts -->
├── services/     # one file per backend resource, JSDoc-documented functions <!-- js -->
├── hooks/        # reusable hooks (data hooks wrap services)
├── components/   # shared UI components (one folder per component)
├── pages/        # route-level screens
├── store/        # Redux Toolkit: index.ts (makeStore), hooks.ts, slices/
├── types/        # shared TypeScript types <!-- ts -->
├── types/        # shared JSDoc @typedef definitions <!-- js -->
├── utils/        # pure helpers
└── test/         # test setup and MSW handlers
```

## Conventions

- TypeScript only: all source files are `.ts`/`.tsx`. <!-- ts -->
- JavaScript project: source files are `.js`/`.jsx`. Migrating to TypeScript is a separate, planned task, not part of feature work. <!-- js -->
- Components: function components, named exports, `<Name>Props` interface, folder per component with `index.ts`, test next to the file. <!-- ts -->
- Components: function components, named exports, props documented with a JSDoc `@typedef`, folder per component with `index.js`, test next to the file. <!-- js -->
- Components never call the HTTP client directly: component → React Query hook → service → `api/client.ts`.
- API data lives only in React Query; Redux holds client-only state (cart, wizard, UI). Never copy API responses into Redux.
- Every async UI handles loading, error and empty states.
- Env variables start with `VITE_` and are listed in `.env.example`.
- Absolute imports via `@/` alias.
- Commits follow Conventional Commits (`feat(scope): …`).

## Testing

- New components, hooks and services need tests. Query by role/label, interact with `userEvent`, mock network with MSW.
- Bug fixes include a test that fails before the fix.

## Do not

- Do not use `any`; define a type in `src/types/`. <!-- ts -->
- Do not leave props or API responses undocumented; describe them with JSDoc `@typedef` in `src/types/`. <!-- js -->
- Do not add new dependencies without saying why in the PR.
- Do not edit `dist/`, generated API clients, or `package-lock.json` by hand.
- Do not commit secrets or `.env` files.

## Definition of done

`npm run lint`, `npm run typecheck` and `npm test` pass, and the change works in the browser. <!-- ts -->
`npm run lint` and `npm test` pass, and the change works in the browser. <!-- js -->
