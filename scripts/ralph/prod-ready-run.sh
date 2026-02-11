#!/usr/bin/env bash
set -euo pipefail

if [ $# -lt 1 ]; then
  echo "Usage: $0 \"<plan prompt>\""
  exit 1
fi

PROMPT="$1"

python ~/.claude/skills/ralph-orchestrator/scripts/orchestrate.py --plan "$PROMPT" --run --max-iterations 100
codex review --base HEAD~10 -c 'reasoningEffort="high"'
