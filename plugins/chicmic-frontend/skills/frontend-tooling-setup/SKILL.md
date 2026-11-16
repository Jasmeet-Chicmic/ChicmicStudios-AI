---
name: frontend-tooling-setup
description: Use when setting up or fixing ESLint, Prettier, Vitest, Husky, lint-staged, EditorConfig or CI checks in a Chicmic React/Vite/Next.js project, or when starting a new frontend project.
---

# Frontend tooling setup

Gives every Chicmic frontend project the same quality gates: **format → lint → typecheck → test**, enforced on commit and in CI.

Ready-made config files are in `assets/`. Copy them, then adjust only what the project needs.

## Steps

1. **Inspect first**: read `package.json` and any existing config. Do not overwrite working configs without asking — merge instead.
2. **Install** (Vite + React example):

   ```bash
   npm i -D prettier eslint @eslint/js typescript-eslint eslint-plugin-react-hooks \
     eslint-plugin-react-refresh eslint-config-prettier globals \
     vitest jsdom @testing-library/react @testing-library/user-event @testing-library/jest-dom \
     @vitest/coverage-v8 husky lint-staged
   ```

   Next.js projects: keep `eslint-config-next` and add `eslint-config-prettier` last.

3. **Copy configs** from `assets/`:
   - `.prettierrc.json`, `.prettierignore`, `.editorconfig`
   - `eslint.config.js` (flat config)
   - `vitest.config.ts`, and `setup.ts` → `src/test/setup.ts` (also `npm i -D @vitejs/plugin-react` if missing)
   - `ci.yml` → `.github/workflows/ci.yml` (or adapt to GitLab CI if the repo is on GitLab)
4. **Add scripts** to `package.json`:

   ```json
   {
     "lint": "eslint .",
     "lint:fix": "eslint . --fix",
     "format": "prettier --write .",
     "format:check": "prettier --check .",
     "typecheck": "tsc --noEmit",
     "test": "vitest run",
     "test:watch": "vitest",
     "test:coverage": "vitest run --coverage",
     "prepare": "husky"
   }
   ```

5. **Pre-commit hook**: `npx husky init`, then set `.husky/pre-commit` to `npx lint-staged`, and add to `package.json`:

   ```json
   "lint-staged": {
     "*.{ts,tsx,js,jsx}": ["eslint --fix", "prettier --write"],
     "*.{json,css,scss,md}": "prettier --write"
   }
   ```

6. **Verify**: run `npm run format`, `npm run lint`, `npm run typecheck`, `npm test`. On an existing project, commit the formatting change as its own commit (`style: apply prettier`) so real changes stay reviewable.
7. Update the project's `AGENTS.md` **Commands** section with the new scripts.
