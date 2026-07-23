#!/usr/bin/env bash
set -Eeuo pipefail

TARGET_BRANCH="${TARGET_BRANCH:-premium-redesign}"
fail() { printf '\nERROR: %s\n' "$*" >&2; exit 1; }
info() { printf '\n==> %s\n' "$*"; }

ROOT="$(git rev-parse --show-toplevel 2>/dev/null)" || fail "Run this inside the Git repository."
cd "$ROOT"

CURRENT_BRANCH="$(git branch --show-current)"
[[ "$CURRENT_BRANCH" == "$TARGET_BRANCH" ]] || fail "Switch to '$TARGET_BRANCH' first. Current branch: '$CURRENT_BRANCH'."
[[ -z "$(git status --porcelain)" ]] || fail "The working tree is not clean. Commit or discard changes first."

info "Synchronising with origin/$TARGET_BRANCH"
git fetch origin
git pull --ff-only origin "$TARGET_BRANCH"

MESSAGE="${1:-Trigger Cloudflare preview deployment}"
info "Creating preview trigger commit"
git commit --allow-empty -m "$MESSAGE"
git push origin "$TARGET_BRANCH"

printf '\nDONE\nPreview branch: %s\nCommit: %s\nCloudflare should create a preview deployment automatically.\n' \
  "$TARGET_BRANCH" "$(git rev-parse --short HEAD)"
