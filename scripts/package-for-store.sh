#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd "${SCRIPT_DIR}/.." && pwd)"

cd "${ROOT_DIR}"

if [[ -f "package.json" ]] && command -v npm >/dev/null 2>&1; then
  if [[ ! -d "node_modules/sass" ]]; then
    if [[ -f "package-lock.json" ]]; then
      npm ci
    else
      npm install
    fi
  fi
  npm run build:css
fi

if ! command -v zip >/dev/null 2>&1; then
  echo "Error: 'zip' not found. Install zip and try again."
  exit 1
fi

if ! command -v python3 >/dev/null 2>&1; then
  echo "Error: 'python3' not found. Required to read version from manifest.json."
  exit 1
fi

if [[ ! -f "manifest.json" ]]; then
  echo "Error: manifest.json not found in ${ROOT_DIR}."
  exit 1
fi

VERSION="$(
  python3 - <<'PY'
import json

with open("manifest.json", "r", encoding="utf-8") as f:
    manifest = json.load(f)

print(manifest["version"])
PY
)"

OUTPUT_DIR="${ROOT_DIR}/dist"
ARCHIVE_NAME="${1:-prime-numbers-v${VERSION}.zip}"
ARCHIVE_PATH="${OUTPUT_DIR}/${ARCHIVE_NAME}"

INCLUDE_PATHS=(
  "manifest.json"
  "popup.html"
  "css"
  "js"
  "icons"
)

for path in "${INCLUDE_PATHS[@]}"; do
  if [[ ! -e "${path}" ]]; then
    echo "Error: required path '${path}' not found."
    exit 1
  fi
done

mkdir -p "${OUTPUT_DIR}"
rm -f "${ARCHIVE_PATH}"

zip -r -9 "${ARCHIVE_PATH}" "${INCLUDE_PATHS[@]}" \
  -x "*.DS_Store" "*/.DS_Store"

echo "Done: ${ARCHIVE_PATH}"
echo "Verify the archive: manifest.json must be at the root after unpacking."
