#!/usr/bin/env bash
# ─────────────────────────────────────────────────────────────────────────────
# create_github_repo.sh
#
# Creates a new GitHub repository and pushes this project to it.
#
# Usage:
#   chmod +x scripts/create_github_repo.sh
#   ./scripts/create_github_repo.sh                          # default repo name
#   ./scripts/create_github_repo.sh my-custom-name          # custom name
#   ./scripts/create_github_repo.sh my-custom-name public   # make it public
#
# Prerequisites:
#   brew install gh   →   then   gh auth login
# ─────────────────────────────────────────────────────────────────────────────

set -e

REPO_NAME="${1:-ca-lead-capture-demo-booking}"
VISIBILITY="${2:-private}"
DESCRIPTION="CA Firm Lead Capture & Demo Booking — Typeform → Calendly → Zoom → Google Calendar"

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  Lead Capture System — GitHub Repository Setup"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# ── Check prerequisites ────────────────────────────────────────────────────
if ! command -v gh &>/dev/null; then
  echo ""
  echo "❌  GitHub CLI (gh) not found."
  echo "    Install:  brew install gh"
  echo "    Login:    gh auth login"
  exit 1
fi

if ! gh auth status &>/dev/null; then
  echo ""
  echo "❌  Not authenticated. Run:  gh auth login"
  exit 1
fi

GITHUB_USER=$(gh api user --jq .login)
echo ""
echo "✅  Logged in as: $GITHUB_USER"
echo "📦  Repo name:    $REPO_NAME ($VISIBILITY)"
echo ""

# ── Move to project root ───────────────────────────────────────────────────
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
cd "$PROJECT_ROOT"

# ── Init git if not already ────────────────────────────────────────────────
if [ ! -d ".git" ]; then
  echo "🔧  Initialising git..."
  git init
  git add -A
  git commit -m "Initial commit — CA Lead Capture & Demo Booking System"
fi

# ── Create repo on GitHub and push ────────────────────────────────────────
echo "🚀  Creating repository on GitHub..."

if gh repo create "$REPO_NAME" \
    --description "$DESCRIPTION" \
    --"$VISIBILITY" \
    --source=. \
    --remote=origin \
    --push 2>/dev/null; then
  echo ""
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  echo "  ✅  Done!"
  echo "      https://github.com/$GITHUB_USER/$REPO_NAME"
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
else
  # Repo already exists — just push
  echo "ℹ️   Repo exists. Pushing to existing remote..."
  git remote remove origin 2>/dev/null || true
  git remote add origin "https://github.com/$GITHUB_USER/$REPO_NAME.git"
  git branch -M main
  git push -u origin main
  echo ""
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  echo "  ✅  Pushed!"
  echo "      https://github.com/$GITHUB_USER/$REPO_NAME"
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
fi
echo ""
