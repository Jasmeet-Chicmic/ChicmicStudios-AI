---
name: code-review
description: Use when asked to review code, a diff, a branch or a pull request in a Chicmic React or Next.js project. Produces a prioritized review against team standards.
---

# Code review

Review the change against the project's `AGENTS.md` first, then against the checklist below.

## How to run the review

1. Find the change set: `git diff --stat origin/main...HEAD`, then read each changed file in full (not just the hunk) so you understand context.
2. Run the project's checks if they exist and report the result: `npm run lint`, `npm run typecheck`, `npm test`.
3. Go through the checklist. Only report real problems — do not pad the review.
4. Output in the format at the bottom.

## Checklist

### Correctness

- Logic does what the PR / ticket says; edge cases handled (empty list, null API response, network error, slow network).
- No unhandled promise rejections; `async` errors are caught and surfaced to the user.
- No stale closures in React hooks; dependency arrays are complete.
- Effects clean up subscriptions, timers, listeners and abort in-flight requests.

### Security

- No secrets, API keys or tokens committed. Env values come from `.env` / `import.meta.env` / `process.env`.
- No `dangerouslySetInnerHTML` / `innerHTML` with unsanitized input.
- User input is validated before being sent to the API.

### Performance

- No heavy work during render; no unnecessary client components in Next.js (see `react-performance`).
- Lists have stable `key`s; expensive components memoized only where measured.
- Images use `next/image` or explicit width/height and lazy loading; no large new dependencies without reason.

### Maintainability

- Follows the folder structure and naming rules in `AGENTS.md`.
- No dead code, commented-out blocks, or `console.log` left behind.
- Types: no `any` unless justified in a comment.
- New logic has tests (see the `react-testing` skill).

## Output format

```markdown
## Summary

One or two sentences: what the change does and overall verdict (Approve / Request changes).

## Checks

- lint: pass/fail · typecheck: pass/fail · tests: pass/fail (N passed)

## Must fix

1. `path/file.tsx:42` — problem → suggested fix

## Should fix

1. ...

## Nits (optional)

- ...
```

If there is nothing in a section, omit the section.
