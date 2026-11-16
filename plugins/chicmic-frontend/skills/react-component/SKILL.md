---
name: react-component
description: Use when creating or refactoring a React component, page, screen, layout or custom hook in a Chicmic React, Vite or Next.js project.
---

# React component

The project's `AGENTS.md` wins over this skill wherever they disagree.

## Steps

1. Check whether a similar component already exists (`src/components`, `src/shared`, `src/ui`) — extend it instead of duplicating.
2. Create the folder and files using the layout below.
3. Write the component following the rules.
4. Add a test (use the `react-testing` skill).
5. Run `npm run lint`, `npm run typecheck` (if present) and `npm test`; fix everything before finishing.

## Layout

```text
src/components/UserCard/
├── UserCard.tsx          # component
├── UserCard.module.scss  # styles (or Tailwind classes inline — follow AGENTS.md)
├── UserCard.test.tsx     # tests
└── index.ts              # export { UserCard } from './UserCard';
```

Pages go in `src/pages/` (Vite) or `app/` (Next.js App Router). Hooks go in `src/hooks/useThing.ts`.

## Rules

- Function components with a named export. No default exports except Next.js pages/layouts.
- Props interface named `<Component>Props`, declared above the component.
- PascalCase component files, camelCase hooks starting with `use`.
- Components do **not** call `fetch`/`axios` directly — use the service/hook layer (see `api-integration` skill).
- Every async UI handles three states: loading, error, empty.
- Accessibility: real `<button>` for actions, `alt` on images, labels on inputs, keyboard reachable.
- No inline magic numbers/strings for colours or spacing — use theme tokens/variables.
- Keep components under ~200 lines; split sub-components or extract a hook when larger.
- Next.js: add `'use client'` only when the component needs state, effects or browser APIs.

See `references/example.tsx` for the reference implementation.
