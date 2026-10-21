# Agent instructions

## Starting a feature or planning

Before implementing a feature or preparing a plan, always check out the `main` branch and verify
that it is up to date with `origin/main` (`git fetch origin main`, followed by
`git pull --ff-only`). Stop and ask for guidance if it cannot be fast-forwarded.

## Review before opening a pull request

Before opening a pull request, invoke a subagent to review the branch diff. Fix all high- and
medium-severity findings before opening the pull request. For each low-severity finding, create an
issue in the repository.
