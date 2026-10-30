#!/bin/zsh
# One-time setup: creates the GitHub repo, turns on GitHub Pages (deployed by Actions), and pushes.
# After this, every push to main redeploys the site automatically.
set -e
cd "$(dirname "$0")/.."
REPO=Pactwright/pactwright.github.io

echo "1/3 Creating $REPO (public)…"
if gh repo view "$REPO" >/dev/null 2>&1; then
  echo "    already exists"
else
  gh repo create "$REPO" --public \
    --description "Pactwright: landing page and documentation" \
    --homepage https://pactwright.github.io/
fi
git remote get-url origin >/dev/null 2>&1 || git remote add origin "https://github.com/$REPO.git"

echo "2/3 Turning on GitHub Pages (source: GitHub Actions)…"
if gh api "repos/$REPO/pages" >/dev/null 2>&1; then
  gh api -X PUT "repos/$REPO/pages" -f build_type=workflow >/dev/null
else
  gh api -X POST "repos/$REPO/pages" -f build_type=workflow >/dev/null
fi
echo "    done"

echo "3/3 Pushing main (this starts the deploy)…"
git -c credential.helper= -c credential.helper='!gh auth git-credential' push -u origin main

echo
echo "Deploy started: https://github.com/$REPO/actions"
echo "The site will be at https://pactwright.github.io/ in about two minutes."
