---
name: agents-md-writer
description: Use when asked to create, generate, audit or update an AGENTS.md (or CLAUDE.md) file for a repository, especially an existing Chicmic project that does not have one yet.
---

# Writing AGENTS.md for a project

AGENTS.md is read by the agent at the start of every session, so every line costs context. Keep it **under 150 lines**, factual, and specific to this repo. Never invent commands or conventions — only write what you verified in the code.

## Steps

1. **Detect the stack** — read `package.json` (dependencies, scripts), lock file, `tsconfig.json`, framework config (`vite.config.*`, `next.config.*`), lint/format config.
2. **Detect the language**: `tsconfig.json` means TypeScript. No `tsconfig.json` in an existing project means JavaScript: drop TypeScript-only lines (`typecheck`, "no `any`", `types/`) and describe how props and data shapes are documented (JSDoc or nothing). A **new** project must be TypeScript; if it is not, stop and tell the user to recreate it from a TypeScript starter.
3. **Pick a template** from this marketplace repo's `templates/` folder if available (`AGENTS.react.md` for Vite/CRA, `AGENTS.nextjs.md` for Next.js). Lines ending in `<!-- ts -->` or `<!-- js -->` apply to that language only: keep the matching ones and remove the markers. Otherwise use the section list below.
4. **Map the folders** — list `src/` (or `app/` for Next.js) two levels deep and describe what lives where.
5. **Learn the conventions from the code**, not from assumptions: open 3–5 representative files (a component, a service/API file, a store, a test) and note naming, state management, styling, API pattern, error handling.
6. **Verify every command** you list by checking it exists in `package.json` scripts. Run `lint`, `test`, `build` if cheap, and note anything broken.
7. Write the file, then create `CLAUDE.md` containing only `@AGENTS.md` if it doesn't exist.
8. Finish with a short list of **questions for the tech lead** — things you could not determine from the code (for example "Is Redux being phased out in favour of Zustand?").

## Required sections

```markdown
# <Project name>

## Overview — 2–3 lines: what the product is, platform(s), client.

## Tech stack — framework + version, language, state, styling, testing, build tool.

## Commands — install, dev, build, lint, format, test, typecheck (exact commands).

## Project structure — folder map with one line each.

## Conventions — naming, components, state, API calls, styling, errors, i18n.

## Testing — framework, where tests live, what must be tested.

## Do not — hard rules (generated folders, files never to edit, banned patterns).

## Definition of done — what must pass before a task is complete.
```

## Rules for good AGENTS.md content

- Prefer "Use X" over "Don't use Y"; when you write a "Do not", say what to do instead.
- Point to example files (`See src/components/Button/ for the standard component layout`) rather than pasting large code blocks.
- No secrets, URLs of internal servers with credentials, or personal data.
- If the repo is a monorepo, put a short root AGENTS.md and a specific AGENTS.md in each package.
