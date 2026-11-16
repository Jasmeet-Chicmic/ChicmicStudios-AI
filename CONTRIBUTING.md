# Contributing

## When to add a skill

Add a skill when the team does the same kind of task **every week** and the agent keeps getting it wrong or doing it differently each time. Project-specific facts (folder names, commands) belong in that project's `AGENTS.md`, not in a skill.

## Steps

1. Create a branch: `feat/skill-<name>`.
2. Scaffold: `npm run new-skill -- <plugin> <skill-name> "Use when ..."`.
3. Write the skill (rules below).
4. Bump `version` in the plugin's `.claude-plugin/plugin.json` (patch for wording, minor for a new skill, major if you remove or rename one).
5. Add a line to `CHANGELOG.md`.
6. `npm run check`.
7. Test it in a real project (see README → "Test a skill locally").
8. Open a PR; one reviewer from the frontend team approves.

## Writing a good SKILL.md

- **`name`**: kebab-case, same as the folder, max 64 characters.
- **`description`**: starts with "Use when …" and names the concrete situations and keywords (React component, Server Action, Zustand store). This is the only part the agent reads before deciding to load the skill — vague descriptions mean the skill never triggers.
- **Body**: numbered steps, short rules, one template or example. Imperative voice ("Create…", "Run…").
- Keep `SKILL.md` under ~200 lines. Move long examples into `references/` and mention them as `` `references/file.ext` `` — the validator checks that the file exists.
- Always end with how to verify (lint, tests, manual check).
- Never include secrets, client names, internal URLs or credentials.
- The project's `AGENTS.md` overrides a skill; say so when a rule may differ per project.

## What the validator enforces

- `marketplace.json`: kebab-case name, owner, unique plugins, local sources exist.
- `plugin.json`: exists, name matches the marketplace entry, semver version.
- Each skill: `SKILL.md` with frontmatter, valid `name` matching its folder, `description` ≤ 1024 chars without `<` `>`, non-empty body, referenced `references/` files exist, no duplicate skill names across plugins.
- Each `templates/AGENTS.*.md`: has `{{PROJECT_NAME}}`, all required sections, ≤ 150 lines.
