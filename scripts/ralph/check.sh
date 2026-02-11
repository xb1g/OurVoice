#!/usr/bin/env bash
set -euo pipefail

python ~/.claude/skills/ralph-orchestrator/scripts/orchestrate.py --check
ralph preflight
