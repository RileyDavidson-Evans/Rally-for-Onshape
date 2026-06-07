#!/bin/sh
set -e

echo "Building Safari extension assets..."

cd "$CI_WORKSPACE"

npm ci
npm run build

echo "Safari extension assets built."
