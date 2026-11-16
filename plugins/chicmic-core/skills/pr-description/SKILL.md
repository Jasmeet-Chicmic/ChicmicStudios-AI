---
name: pr-description
description: Use when asked to write or update a pull request / merge request description for the current branch in a Chicmic project.
---

# Pull request description

1. Collect the facts:
   - `git log --oneline origin/main..HEAD`
   - `git diff --stat origin/main...HEAD`
   - Read the main changed files.
2. Find the ticket ID in the branch name (for example `feature/PROJ-123-login`) and include it.
3. Write the description in the format below. Be factual — describe what changed, not how hard it was.

## Format

```markdown
## What

Short summary of the change (1–3 sentences). Ticket: PROJ-123

## Why

The problem or requirement this solves.

## How

- Key implementation points, one per line.

## Screenshots / video

<!-- Required for any UI change. -->

## Testing

- [ ] Unit tests added/updated
- [ ] Tested manually on: Chrome / Safari / Android / iOS
- Steps to test:
  1. ...

## Checklist

- [ ] `npm run lint` and `npm test` pass
- [ ] No console logs or commented-out code
- [ ] AGENTS.md updated if commands, structure or conventions changed
```

Remove sections that do not apply (for example Screenshots for a pure refactor), but always keep Testing.
