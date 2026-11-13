#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")"

if [[ -z "$(git status --porcelain)" ]]; then
  echo "Nothing to publish — the live site is already up to date."
  exit 0
fi

git add -A
git -c user.name="Emna" -c user.email="smaaliemna1@gmail.com" commit -m "Portfolio update — $(date '+%Y-%m-%d %H:%M')"
git push origin main

echo
echo "Pushed. GitHub Pages will update in about a minute:"
echo "https://emna9.github.io/portfolio/"
