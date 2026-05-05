#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd "${SCRIPT_DIR}/.." && pwd)"

cd "${ROOT_DIR}"

if ! command -v zip >/dev/null 2>&1; then
  echo "Ошибка: команда 'zip' не найдена. Установите zip и повторите."
  exit 1
fi

if ! command -v python3 >/dev/null 2>&1; then
  echo "Ошибка: команда 'python3' не найдена. Нужна для чтения версии из manifest.json."
  exit 1
fi

if [[ ! -f "manifest.json" ]]; then
  echo "Ошибка: manifest.json не найден в ${ROOT_DIR}."
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
    echo "Ошибка: обязательный путь '${path}' не найден."
    exit 1
  fi
done

mkdir -p "${OUTPUT_DIR}"
rm -f "${ARCHIVE_PATH}"

zip -r -9 "${ARCHIVE_PATH}" "${INCLUDE_PATHS[@]}" \
  -x "*.DS_Store" "*/.DS_Store"

echo "Готово: ${ARCHIVE_PATH}"
echo "Проверьте архив: после распаковки в корне должен лежать manifest.json."
