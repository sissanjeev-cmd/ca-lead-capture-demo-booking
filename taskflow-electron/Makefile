.PHONY: build-mac clean help

help:
	@echo "TaskFlow macOS build agent"
	@echo ""
	@echo "  make build-mac   — install deps and build universal DMG"
	@echo "  make clean       — remove build output"

build-mac:
	@echo "→ Installing dependencies…"
	npm install
	@echo "→ Building macOS DMG…"
	npm run dist
	@echo ""
	@echo "✅ Done. DMG is in dist/"
	@ls dist/*.dmg 2>/dev/null || true

clean:
	rm -rf dist/
