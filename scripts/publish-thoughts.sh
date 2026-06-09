#!/bin/sh
set -e

npm run sync:thoughts
git add .

if git diff --cached --quiet; then
  echo "No thought changes to commit."
  exit 0
fi

git commit -m "Update thoughts"
git push
