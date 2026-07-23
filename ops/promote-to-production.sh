#!/usr/bin/env bash
set -Eeuo pipefail

SOURCE_BRANCH="${SOURCE_BRANCH:-premium-redesign}"
PRODUCTION_BRANCH="${PRODUCTION_BRANCH:-main}"
YES=false
[[ "${1:-}" == "--yes" ]] && YES=true

fail() { printf '\nERROR: %s\n' "$*" >&2; exit 1; }
info() { printf '\n==> %s\n' "$*"; }

ROOT="$(git rev-parse --show-toplevel 2>/dev/null)" || fail "Run this inside the Git repository."
cd "$ROOT"

[[ -z "$(git status --porcelain)" ]] || fail "The working tree is not clean. Commit or discard changes first."

info "Fetching latest branches"
git fetch origin --prune

git show-ref --verify --quiet "refs/remotes/origin/$SOURCE_BRANCH" || fail "origin/$SOURCE_BRANCH does not exist."
git show-ref --verify --quiet "refs/remotes/origin/$PRODUCTION_BRANCH" || fail "origin/$PRODUCTION_BRANCH does not exist."

SOURCE_SHA="$(git rev-parse "origin/$SOURCE_BRANCH")"
PROD_SHA="$(git rev-parse "origin/$PRODUCTION_BRANCH")"

if git merge-base --is-ancestor "$SOURCE_SHA" "$PROD_SHA"; then
  fail "$SOURCE_BRANCH is already fully included in $PRODUCTION_BRANCH."
fi

if ! git merge-base --is-ancestor "$PROD_SHA" "$SOURCE_SHA"; then
  fail "Branches have diverged. Review and merge manually instead of using the production script."
fi

printf '\nProduction promotion\n  From: %s (%s)\n  To:   %s (%s)\n' \
  "$SOURCE_BRANCH" "${SOURCE_SHA:0:7}" "$PRODUCTION_BRANCH" "${PROD_SHA:0:7}"

if [[ "$YES" != true ]]; then
  read -r -p "Type PROMOTE to continue: " CONFIRM
  [[ "$CONFIRM" == "PROMOTE" ]] || fail "Promotion cancelled."
fi

BACKUP_TAG="backup-${PRODUCTION_BRANCH}-$(date -u +%Y%m%d-%H%M%S)"
info "Creating backup tag $BACKUP_TAG"
git tag "$BACKUP_TAG" "$PROD_SHA"
git push origin "$BACKUP_TAG"

info "Fast-forwarding $PRODUCTION_BRANCH to approved $SOURCE_BRANCH"
git switch "$PRODUCTION_BRANCH"
git pull --ff-only origin "$PRODUCTION_BRANCH"
git merge --ff-only "origin/$SOURCE_BRANCH"
git push origin "$PRODUCTION_BRANCH"

PRODUCTION_SHA="$(git rev-parse HEAD)"
RELEASE_TAG="production-$(date -u +%Y%m%d-%H%M%S)"
info "Tagging production release $RELEASE_TAG"
git tag "$RELEASE_TAG" "$PRODUCTION_SHA"
git push origin "$RELEASE_TAG"

info "Returning to $SOURCE_BRANCH"
git switch "$SOURCE_BRANCH"
git pull --ff-only origin "$SOURCE_BRANCH"

printf '\nDONE\nProduction branch: %s\nProduction commit: %s\nBackup tag: %s\nRelease tag: %s\nCloudflare production deployment should start automatically.\n' \
  "$PRODUCTION_BRANCH" "${PRODUCTION_SHA:0:7}" "$BACKUP_TAG" "$RELEASE_TAG"
