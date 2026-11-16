---
name: commit-message
description: Use when asked to write a git commit message or to commit staged changes in a Chicmic project. Follows Conventional Commits.
---

# Commit message

Chicmic projects use [Conventional Commits](https://www.conventionalcommits.org/).

1. Read the staged change: `git diff --cached`. If nothing is staged, ask which files to stage instead of staging everything.
2. Pick the type:

   | Type       | Use for                              |
   | ---------- | ------------------------------------ |
   | `feat`     | New feature                          |
   | `fix`      | Bug fix                              |
   | `refactor` | Code change with no behaviour change |
   | `perf`     | Performance improvement              |
   | `test`     | Adding or fixing tests only          |
   | `style`    | Formatting only                      |
   | `docs`     | Documentation, including AGENTS.md   |
   | `chore`    | Tooling, dependencies, config, build |

3. Write it:

   ```text
   <type>(<scope>): <imperative summary, max 72 chars, no full stop>

   <optional body: what and why, wrapped at 72 chars>

   Refs: PROJ-123
   ```

   - `scope` is the feature or module: `auth`, `cart`, `checkout`, `profile`.
   - Use the ticket ID from the branch name in `Refs:` when there is one.

## Examples

```text
feat(checkout): add coupon code field

fix(auth): refresh token before it expires instead of after 401

perf(products): virtualize product list
```
