#!/usr/bin/env bash
set -euo pipefail

PROTECTED_FILES=(
  "src/lib/calculations/engine.ts"
  "src/lib/calculations/recommendation.ts"
  "src/lib/calculations/scenarios.ts"
  "src/lib/calculations/confidence.ts"
  "src/lib/calculations/stress-test.ts"
  "src/lib/golden-case.ts"
  "scripts/verify-golden.ts"
)

BASE_REF="${1:-main}"
CHANGED=$(git diff --name-only "origin/${BASE_REF}"...HEAD 2>/dev/null || git diff --name-only "${BASE_REF}"...HEAD)

FAILED=0
for f in "${PROTECTED_FILES[@]}"; do
  if echo "$CHANGED" | grep -qx "$f"; then
    echo "ERROR: protected calculation file was modified: $f" >&2
    FAILED=1
  fi
done

if [ "$FAILED" -eq 1 ]; then
  echo "One or more protected files were modified." >&2
  exit 1
fi

echo "OK: no protected calculation files were modified."
exit 0
