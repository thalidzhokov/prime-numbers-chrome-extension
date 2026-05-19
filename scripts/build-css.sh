#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd "${SCRIPT_DIR}/.." && pwd)"

cd "${ROOT_DIR}"

if command -v npm >/dev/null 2>&1; then
  if [[ ! -d "node_modules/sass" ]]; then
    if [[ -f "package-lock.json" ]]; then
      npm ci
    else
      npm install
    fi
  fi
  exec npm run build:css
fi

if ! command -v docker >/dev/null 2>&1; then
  echo "Ошибка: нужен npm или docker для сборки SCSS."
  exit 1
fi

docker run --rm \
  -v "${ROOT_DIR}:/app" \
  -w /app \
  node:22-alpine \
  sh -c 'if [ ! -d node_modules/sass ]; then npm ci 2>/dev/null || npm install; fi; npm run build:css'
