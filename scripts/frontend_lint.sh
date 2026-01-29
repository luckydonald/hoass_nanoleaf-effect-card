#!/usr/bin/env bash
set -euo pipefail

# Usage: ./scripts/frontend_lint.sh <frontend_dir>
FRONTEND_DIR="$1"

if [ -z "${FRONTEND_DIR}" ] || [ ! -f "${FRONTEND_DIR}/package.json" ]; then
  echo "No frontend detected or no package.json - skipping frontend lint."
  exit 0
fi

cd "${FRONTEND_DIR}"

# Run both type-check and lint (if present) and return non-zero if either fails.
STATUS=0

if command -v npm >/dev/null 2>&1; then
  # type-check
  if grep -q '"type-check"' package.json >/dev/null 2>&1; then
    echo "Running: npm run type-check"
    npm run type-check || STATUS=$?
  fi

  # lint
  if grep -q '"lint"' package.json >/dev/null 2>&1; then
    echo "Running: npm run lint"
    npm run lint || STATUS=$((STATUS|$?))
  fi

elif command -v yarn >/dev/null 2>&1; then
  # type-check
  if grep -q '"type-check"' package.json >/dev/null 2>&1; then
    echo "Running: yarn type-check"
    yarn type-check || STATUS=$?
  fi

  # lint
  if grep -q '"lint"' package.json >/dev/null 2>&1; then
    echo "Running: yarn lint"
    yarn lint || STATUS=$((STATUS|$?))
  fi

else
  echo "No npm/yarn found - skipping frontend lint."
fi

exit ${STATUS}
