# Agent instructions

These instructions mirror the repository and global Claude Code guidance. The project-specific
`CLAUDE.md` adds design and operational details and takes precedence over global guidance when they
conflict. The game design source of truth is `game-design.md`; read the relevant sections before
changing game rules.

## Before starting work

- Check whether the requested behavior or fix already exists. Search the codebase and, when
  available, the issue tracker before implementing it.
- Read this file, the project `CLAUDE.md`, the README, and relevant files under `docs/`. Follow the
  existing architecture, naming, and framework conventions.
- Before any code or documentation change or implementation plan, run `git fetch origin main` and
  inspect `origin/main` so work uses the current default branch.
- Check `git status` and the current branch. Continue on the current branch when its purpose matches
  the task. Otherwise, create a task branch from the up-to-date `origin/main`, using a type prefix
  such as `feat/`, `fix/`, or `docs/` and a concise slug.
- If the working tree has changes you did not make, stop and ask how to preserve them before
  switching branches or editing. Do not stash, discard, or overwrite changes automatically.
- If the default branch cannot be updated with a fast-forward, stop and ask for guidance.

## Parallel work

- Use subagents when independent work can be split and doing so improves speed or review quality.
- Launch independent investigations together. Give each agent complete scope, context, and expected
  output.
- Do not have concurrent agents edit the same working tree. Isolate parallel writers in separate
  worktrees or assign non-overlapping files.
- Keep dependent steps sequential and avoid spawning an agent for a quick read or single-file edit.

## Implementation

- Keep changes minimal. Reuse existing behavior and avoid abstractions or extension points that the
  task does not need. Remove obsolete code in the same change; if a larger out-of-scope cleanup is
  needed, report it and create a repository issue.
- Put state and logic in the module that owns that concern. Keep modules focused and avoid growing
  composition roots into god objects.
- Define shared constants, configuration, theme tokens, and formatting rules once.
- Use explicit types. Do not introduce `any`, unchecked casts, or blanket ignores; prefer precise
  types or `unknown` with validation and narrowing.
- Use specific names that are easy to find in the codebase. Avoid generic names such as `data`,
  `handler`, or `Manager` when a more descriptive name is available.
- Prefer early returns, avoid duplicated logic, and keep nesting shallow.
- Keep functions focused and generally between 4 and 20 lines where practical. Do not exceed 80
  lines per non-test function, 4 parameters, cyclomatic complexity 10, or nesting depth 3; split
  responsibilities when needed. Keep files under 500 lines where practical.
- Include the offending value and expected shape in exception messages unless the value is
  sensitive. Never log sensitive data; use structured logs for observability and plain text for CLI
  output.
- Wrap external, unstable, or optional APIs in small tested adapters. Handle unavailable
  capabilities safely, provide a manual or offline fallback where feasible, clean up acquired
  resources, support cancellation, and validate external or model-generated output.
- Document architectural decisions and their reasons in project documentation. Update user-facing
  docs when public behavior, architecture, or operations change.

## Game-specific design

- Resolve game-rule questions from `game-design.md` and relevant documents under `docs/` before
  implementation. Keep game rules in the server-side engine; do not reimplement them in the UI.
- Keep policy trees, groups, cost weights, regime stages, utopia requirements, historical figures,
  and other game content in typed content modules, separate from engine logic and UI.
- All player-visible text must use the existing i18n mechanism for Brazilian Portuguese and English.
  Never translate the name “Decreto”.
- Keep violence restrained in text, headlines, and images. Do not implement genocide or extermination
  of ethnic or religious groups.

## Tests and validation

- Use TDD where practical. Every added or changed function must have a meaningful test in the
  project's existing framework, in the same change. Bug fixes need regression tests.
- Tests must exercise real behavior and must not be removed or weakened just to make a change pass.
  If a test becomes obsolete because its behavior was intentionally removed, explain that explicitly.
- Mock external I/O with named fake classes, not inline stubs. Do not install global test doubles for
  optional or environment-dependent features; tests should opt into the fake they need.
- Run relevant project validation before committing: typecheck, lint, complexity checks, tests, and
  builds as applicable. Apps are independent packages; a frontend-only change need not build the
  backend, and vice versa, unless shared packages changed.
- Respect the configured hooks. Never bypass them with `--no-verify`.
- Report any validation that could not be run and its reason.

## Commits and pull requests

- Use Conventional Commits (`feat`, `fix`, `docs`, `style`, `refactor`, `perf`, `test`, `build`,
  `ci`, `chore`) and a matching type-prefixed branch name.
- Keep one concern per commit and PR. Follow the repository PR template when one exists. Never
  commit secrets, keys, or `.env` files.
- Before opening a PR, invoke the code-review agent or skill on the full branch diff. Review for
  bugs, unnecessary code, and overengineering. Fix all high- and medium-severity findings before
  opening the PR. Create repository issues for low-severity findings and link them in the PR body.
- Immediately after opening a PR, enable auto-merge with
  `gh pr merge <number> --auto --squash --delete-branch`. If an approval or safety control blocks
  this action, do not bypass it; report the block and request the required approval.
- If CI fails, fix the issue on the same branch and push the correction. Auto-merge should remain
  enabled.

## Repository hooks

- `pre-commit` runs typecheck, lint, complexity checks, and tests.
- `pre-push` runs typecheck, lint, complexity checks, tests/builds, and diff-aware coverage against
  `origin/main`. Every changed code path must be exercised by tests.
- `commit-msg` validates Conventional Commits. Hooks are installed by the package manager's
  `prepare` script; do not install them manually.
