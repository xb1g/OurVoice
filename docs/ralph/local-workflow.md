# Ralph Local Workflow

This repository uses `ralph-orchestrator` as a local-only development accelerator.

## 1. Preflight

```bash
./scripts/ralph/check.sh
```

## 2. Plan + Run

```bash
./scripts/ralph/prod-ready-run.sh "Implement <feature>"
```

## 3. Post-run review

The run script triggers:

- `orchestrate.py --plan "<task>" --run`
- `codex review --base HEAD~10`

Adjust `--base` to the commit range for your change set.

## Notes

- Ralph is intentionally not required by CI.
- CI quality gates remain `pnpm check` on pull requests.
