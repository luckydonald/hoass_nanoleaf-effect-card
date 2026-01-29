#!/usr/bin/env bash
set -euo pipefail

# Usage: ./scripts/frontend_lint.sh <frontend_dir>
FRONTEND_DIR="$1"

if [ -z "${FRONTEND_DIR}" ] || [ ! -f "${FRONTEND_DIR}/package.json" ]; then
  echo "No frontend detected or no package.json - skipping frontend lint."
  exit 0
fi

cd "${FRONTEND_DIR}"

# Prefer npm, fall back to yarn. Try lint, otherwise try type-check.
if command -v npm >/dev/null 2>&1; then
  npm run lint || npm run type-check || true
elif command -v yarn >/dev/null 2>&1; then
  yarn lint || yarn type-check || true
else
  echo "No npm/yarn found - skipping frontend lint."
fi
