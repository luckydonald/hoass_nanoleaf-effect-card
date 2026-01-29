#!/usr/bin/env bash
set -euo pipefail

# Usage: ./scripts/frontend_format.sh <frontend_dir>
FRONTEND_DIR="$1"

if [ -z "${FRONTEND_DIR}" ] || [ ! -f "${FRONTEND_DIR}/package.json" ]; then
  echo "No frontend detected or no package.json - skipping frontend format."
  exit 0
fi

cd "${FRONTEND_DIR}"

# Try lint autofix (lint:fix) if present, else run lint. Then run format if present.
if command -v npm >/dev/null 2>&1; then
  if grep -q '"lint:fix"' package.json >/dev/null 2>&1; then
    npm run lint:fix || true
  elif grep -q '"lint"' package.json >/dev/null 2>&1; then
    npm run lint || true
  fi
  if grep -q '"format"' package.json >/dev/null 2>&1; then
    npm run format || true
  fi
elif command -v yarn >/dev/null 2>&1; then
  if grep -q '"lint:fix"' package.json >/dev/null 2>&1; then
    yarn lint:fix || true
  elif grep -q '"lint"' package.json >/dev/null 2>&1; then
    yarn lint || true
  fi
  if grep -q '"format"' package.json >/dev/null 2>&1; then
    yarn format || true
  fi
else
  echo "No npm/yarn found - skipping frontend format."
fi
