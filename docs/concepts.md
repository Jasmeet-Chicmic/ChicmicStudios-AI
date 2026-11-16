# Concepts: AGENTS.md, skills, plugins, marketplace

## AGENTS.md — the project rulebook

A markdown file at the root of a project. The coding agent reads it at the start of **every** session: stack, commands, folder structure, conventions, things never to do. It is an open convention read by Codex, Cursor, GitHub Copilot, Gemini CLI and others.

Claude Code reads `CLAUDE.md`, so each project also has a one-line `CLAUDE.md`:

```text
@AGENTS.md
```

That imports AGENTS.md, so there is one file to maintain.

## Skill — a how-to for one kind of task

A folder containing `SKILL.md`:

```markdown
---
name: react-component
description: Use when creating or refactoring a React component...
---

# Steps and rules the agent follows
```

The agent only sees the `description` of each skill until a task matches; then it loads the full instructions. That is why many skills don't slow the agent down, and why the description must clearly say **when** to use it. A skill can also be run directly as a slash command: `/react-component`.

Skills can live in three places:

| Location                           | Who gets it                      |
| ---------------------------------- | -------------------------------- |
| `~/.claude/skills/<name>/`         | Only you, in every project       |
| `<project>/.claude/skills/<name>/` | Everyone working in that project |
| `<plugin>/skills/<name>/`          | Everyone who enabled the plugin  |

## Plugin — a package of skills

A folder with `.claude-plugin/plugin.json` (name, version, description) and a `skills/` folder. Plugins can also contain slash commands, subagents, hooks and MCP servers. Packaging skills as a plugin means one place to update, versioned, instead of copying files into every repo.

## Marketplace — the list of plugins

A git repo with `.claude-plugin/marketplace.json` listing the plugins. This repo is the marketplace. People add it once:

```text
/plugin marketplace add your-org/chicmic-ai
/plugin install chicmic-frontend@chicmic-ai
```

Or a project enables it for everyone by committing `.claude/settings.json`:

```json
{
  "extraKnownMarketplaces": {
    "chicmic-ai": { "source": { "source": "github", "repo": "your-org/chicmic-ai" } }
  },
  "enabledPlugins": { "chicmic-frontend@chicmic-ai": true }
}
```

When a teammate opens the project and trusts the folder, Claude Code offers to install those plugins. `npm run init-project` writes this file for you.

## How it fits together

```text
chicmic-ai (marketplace repo)
 ├── chicmic-core      → code-review, pr-description, ...
 └── chicmic-frontend  → react-component, react-performance, nextjs-app-router, ...

each project repo
 ├── AGENTS.md              → project-specific facts
 ├── CLAUDE.md              → "@AGENTS.md"
 └── .claude/settings.json  → enables chicmic-ai plugins
```

Rule of thumb: **facts about one project → AGENTS.md. A repeatable way of doing a task → skill.**

Other agents (Cursor, Codex, Copilot) don't install Claude Code plugins, but they all read AGENTS.md, and several read the same `SKILL.md` format (Agent Skills standard) if you copy skill folders into their skills directory.
