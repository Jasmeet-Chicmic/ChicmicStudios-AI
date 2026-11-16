# Team rollout plan

## Week 1 — pilot

- [ ] Push `chicmicstudios-ai` to the company git host; set `config.marketplaceRepo`; CI green.
- [ ] Pick **two** active projects: one React (Vite) and one Next.js.
- [ ] `npm run init-project` on each, fill AGENTS.md with the `agents-md-writer` skill, tech lead reviews, commit.
- [ ] 2–3 developers use it daily for a week and note every time the agent got something wrong.

## Week 2 — fix and measure

- [ ] Turn each repeated mistake into one AGENTS.md line (project-specific) or a skill change (team-wide).
- [ ] Compare against before: review comments per PR, time to first working version, how often agent output had to be rewritten.
- [ ] Demo to the manager: one task done with and without the setup.

## Week 3+ — roll out

- [ ] **New projects**: add the three files to every project starter/boilerplate, so they exist from the first commit.
- [ ] **Ongoing projects**: one project at a time, run `init-project`, fill AGENTS.md, owner = that project's tech lead.
- [ ] Add to every project's PR template: "AGENTS.md updated if commands, structure or conventions changed".
- [ ] Monthly: review skill usage feedback, prune skills nobody uses, bump versions.

## Ownership

| Item                         | Owner                    |
| ---------------------------- | ------------------------ |
| `chicmicstudios-ai` repo, CI | AI-standards maintainer  |
| `chicmic-frontend` skills    | Frontend lead            |
| Each project's `AGENTS.md`   | That project's tech lead |

## Security notes

- Keep the marketplace repo private if skills mention internal processes.
- Review every third-party skill before adding it — the agent follows its instructions.
- Never put secrets, client data or credentials in AGENTS.md or skills.
