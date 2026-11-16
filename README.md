# chicmic-ai

Shared AI-agent setup for Chicmic Studios **React and Next.js** projects: a **Claude Code plugin marketplace** with team skills, plus **AGENTS.md templates** that work with Claude Code, Codex, Cursor and Copilot.

## What's inside

| Plugin             | Skills                                                                                                                                                                                                                                                            | For                    |
| ------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------- |
| `chicmic-core`     | `code-review`, `pr-description`, `commit-message`, `agents-md-writer`                                                                                                                                                                                             | Every project          |
| `chicmic-frontend` | `react-component`, `react-performance`, `nextjs-app-router`, `state-management`, `api-integration`, `forms-validation`, `error-handling`, `styling-design-system`, `accessibility`, `frontend-security`, `react-testing`, `e2e-testing`, `frontend-tooling-setup` | React / Vite / Next.js |

```text
chicmic-ai/
├── .claude-plugin/marketplace.json   # list of plugins (the "marketplace")
├── plugins/<plugin>/
│   ├── .claude-plugin/plugin.json    # plugin manifest (name, version)
│   └── skills/<skill>/SKILL.md       # one folder per skill (+ references/, assets/)
├── templates/AGENTS.*.md             # AGENTS.md starters per stack
├── scripts/                          # validate, init-project, new-skill
├── tests/                            # node:test suites for the scripts
└── docs/                             # concepts + rollout guide
```

New to plugins and skills? Read [docs/concepts.md](docs/concepts.md) first.

## One-time setup (maintainers)

1. Push this repo to the company GitHub/GitLab.
2. Set the repo location in `package.json`:

   ```json
   "config": { "marketplaceRepo": "your-org/chicmic-ai" }
   ```

   For GitLab or self-hosted git use the clone URL, e.g. `https://gitlab.com/chicmic/chicmic-ai.git`.

3. `npm install` (also installs the pre-commit hook), then `npm run check`.

## Add it to a project

From this repo:

```bash
npm run init-project -- --target ../my-react-app --type react
npm run init-project -- --target ../admin-panel --type nextjs --name "Admin Panel"
```

Types: `react` (Vite / CRA) and `nextjs`. This writes three files into the project:

- `AGENTS.md` — the project rulebook, from the matching template (existing file is kept unless `--force`)
- `CLAUDE.md` — contains `@AGENTS.md` so Claude Code reads the same file
- `.claude/settings.json` — registers the marketplace and enables the right plugins (merged with existing settings)

Then in the project:

1. Open Claude Code and ask: **"Use the agents-md-writer skill to fill in AGENTS.md from this codebase."**
2. Review the result with the tech lead, commit the three files.
3. Teammates pull, open Claude Code, trust the folder, and accept the plugin install prompt.

Manual install (any project, or just for yourself):

```text
/plugin marketplace add your-org/chicmic-ai
/plugin install chicmic-frontend@chicmic-ai
```

## Working on this repo

```bash
npm run check          # everything CI runs: format, markdown lint, validate, tests
npm run validate       # marketplace / plugin / skill / template rules
npm test               # unit tests for the scripts
npm run format         # prettier --write
npm run new-skill -- frontend form-validation "Use when building forms with validation"
```

Test a skill locally before pushing:

```text
/plugin marketplace add /absolute/path/to/chicmic-ai
/plugin install chicmic-frontend@chicmic-ai
```

After changing files, run `/plugin marketplace update chicmic-ai` in Claude Code to pick them up.

See [CONTRIBUTING.md](CONTRIBUTING.md) for how to write a good skill and [docs/rollout.md](docs/rollout.md) for the team rollout plan.
