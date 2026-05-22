#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

echo "▶  TaskFlow macOS Build Agent"
echo "   Working directory: $ROOT"
echo ""

echo "→ Installing npm dependencies…"
npm install

echo "→ Building macOS DMG (electron-builder)…"
npm run dist

DMG=$(ls dist/*.dmg 2>/dev/null | head -1 || true)
if [[ -n "$DMG" ]]; then
  echo ""
  echo "✅ Build complete!"
  echo "   Output: $DMG"
else
  echo ""
  echo "⚠  Build finished but no .dmg found in dist/. Check electron-builder output above."
fi
