#!/usr/bin/env bash
# check-types.sh — full typesjekk av ÉN mappe (krever install).
#
#   ./scripts/check-types.sh lectures/l-19
#   ./scripts/check-types.sh student-liste
#
# Installerer hvis node_modules mangler, og kjører tsc --noEmit.
# Dette fanger det syntakssjekken ikke ser: manglende importer, feil typer,
# API-er som ikke finnes i pakkeversjonen.
#
# Første kjøring tar noen minutter (install). Etterpå ~10 sekunder.

set -euo pipefail

if [ $# -eq 0 ]; then
  echo "Bruk: $0 <mappe> [flere mapper...]"
  echo "Eks:  $0 lectures/l-19 student-liste"
  exit 1
fi

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
FAILED=()

for target in "$@"; do
  dir="$ROOT/$target"
  if [ ! -f "$dir/package.json" ]; then
    echo "  hopper over $target (ingen package.json)"
    continue
  fi

  echo ""
  echo "=== $target ==="

  if [ ! -d "$dir/node_modules" ]; then
    echo "  installerer (dette tar litt)..."
    (cd "$dir" && npm install --no-audit --no-fund --loglevel=error)
  fi

  if (cd "$dir" && npx --no-install tsc --noEmit); then
    echo "  ✓ ingen typefeil"
  else
    echo "  ✗ typefeil"
    FAILED+=("$target")
  fi
done

echo ""
if [ ${#FAILED[@]} -eq 0 ]; then
  echo "Alt grønt."
else
  echo "Feilet: ${FAILED[*]}"
  exit 1
fi
