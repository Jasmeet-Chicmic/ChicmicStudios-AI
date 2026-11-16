# Changelog

## 1.1.0

- TypeScript and JavaScript: `init-project` detects the language (`tsconfig.json` → TypeScript, existing project without it → JavaScript) and writes the matching AGENTS.md. New projects (`--new`, or no `package.json` yet) must be TypeScript.
- AGENTS templates: lines ending in `<!-- ts -->` / `<!-- js -->` apply to one language only; the validator rejects unknown markers.
- `chicmic-core` 1.1.0: `agents-md-writer` detects the language and refuses to set up a new JavaScript project.
- `chicmic-frontend` 1.1.0: `frontend-tooling-setup` has "New projects: TypeScript only" and "Existing JavaScript projects" sections; `eslint.config.js` now lints `.js`/`.jsx`; skills with TypeScript examples explain how to apply them in JavaScript projects.

## 1.0.0

- `chicmic-core` 1.0.0: `code-review`, `pr-description`, `commit-message`, `agents-md-writer`.
- `chicmic-frontend` 1.0.0: `react-component`, `react-performance`, `nextjs-app-router`, `state-management`, `api-integration` (incl. real-time), `forms-validation`, `error-handling`, `styling-design-system`, `accessibility`, `frontend-security`, `react-testing`, `e2e-testing`, `frontend-tooling-setup` (with ESLint, Prettier, Vitest, CI configs).
- AGENTS.md templates: React (Vite) and Next.js.
- Scripts: `validate`, `init-project`, `new-skill`, with tests and CI.
