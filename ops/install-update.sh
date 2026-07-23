#!/usr/bin/env bash
set -Eeuo pipefail

TARGET_BRANCH="${TARGET_BRANCH:-premium-redesign}"
REQUIRED_FILES=(
  "index.html"
  "assets/css/pet-groomer.css"
  "assets/js/scripts.js"
  "assets/js/site-config.js"
)

fail() { printf '\nERROR: %s\n' "$*" >&2; exit 1; }
info() { printf '\n==> %s\n' "$*"; }

[[ $# -eq 1 ]] || fail "Usage: ./ops/install-update.sh path/to/update.zip"
ZIP_INPUT="$1"

ROOT="$(git rev-parse --show-toplevel 2>/dev/null)" || fail "Run this inside the Git repository."
cd "$ROOT"

CURRENT_BRANCH="$(git branch --show-current)"
[[ "$CURRENT_BRANCH" == "$TARGET_BRANCH" ]] || fail "Switch to '$TARGET_BRANCH' first. Current branch: '$CURRENT_BRANCH'."

[[ -f "$ZIP_INPUT" ]] || fail "ZIP not found: $ZIP_INPUT"
ZIP_ABS="$(cd "$(dirname "$ZIP_INPUT")" && pwd)/$(basename "$ZIP_INPUT")"

if [[ -n "$(git status --porcelain)" ]]; then
  fail "The working tree is not clean. Commit, stash, or discard existing changes first."
fi

command -v unzip >/dev/null 2>&1 || fail "The 'unzip' command is required."
command -v rsync >/dev/null 2>&1 || fail "The 'rsync' command is required."

TMP="$(mktemp -d)"
trap 'rm -rf "$TMP"' EXIT

info "Extracting update package"
unzip -q "$ZIP_ABS" -d "$TMP/extracted"

# If the archive contains one outer folder, use its contents as the source root.
mapfile -t TOP_LEVEL < <(find "$TMP/extracted" -mindepth 1 -maxdepth 1 -print)
SRC="$TMP/extracted"
if [[ ${#TOP_LEVEL[@]} -eq 1 && -d "${TOP_LEVEL[0]}" ]]; then
  SRC="${TOP_LEVEL[0]}"
fi

[[ -f "$SRC/index.html" ]] || fail "The update package does not contain index.html at its root."

info "Installing update into $TARGET_BRANCH"
rsync -a --delete \
  --exclude='.git/' \
  --exclude='.github/' \
  --exclude='ops/' \
  --exclude='.devcontainer/' \
  "$SRC/" "$ROOT/"

# Remove the uploaded ZIP if it lives inside the repository.
case "$ZIP_ABS" in
  "$ROOT"/*) rm -f "$ZIP_ABS" ;;
esac

info "Validating required files"
for path in "${REQUIRED_FILES[@]}"; do
  [[ -f "$ROOT/$path" ]] || fail "Missing required file after install: $path"
done

grep -q 'assets/css/pet-groomer.css' index.html || fail "index.html does not reference assets/css/pet-groomer.css"
grep -q 'assets/js/site-config.js' index.html || fail "index.html does not reference assets/js/site-config.js"
grep -q 'assets/js/scripts.js' index.html || fail "index.html does not reference assets/js/scripts.js"

if [[ -z "$(git status --porcelain)" ]]; then
  info "No file changes detected; nothing to commit."
  exit 0
fi

COMMIT_MESSAGE="${COMMIT_MESSAGE:-Install website update}"
info "Committing update"
git add -A
git commit -m "$COMMIT_MESSAGE"

info "Pushing $TARGET_BRANCH"
git push origin "$TARGET_BRANCH"

printf '\nDONE\nBranch: %s\nCommit: %s\nCloudflare preview deployment should start automatically.\n' \
  "$TARGET_BRANCH" "$(git rev-parse --short HEAD)"
