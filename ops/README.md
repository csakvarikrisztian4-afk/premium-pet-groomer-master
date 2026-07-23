# Repository deployment helpers

## Install a generated website update

From the `premium-redesign` branch:

```bash
./ops/install-update.sh path/to/update.zip
```

The script validates the package, preserves the `ops/` folder, commits the changes and pushes the preview branch.

## Trigger a fresh Cloudflare preview

```bash
./ops/publish-preview.sh
```

An optional commit message may be supplied as the first argument.

## Promote an approved preview to production

```bash
./ops/promote-to-production.sh
```

The script requires typing `PROMOTE`, creates a backup tag, fast-forwards `main`, pushes it, creates a production release tag and returns to `premium-redesign`.

For non-interactive use:

```bash
./ops/promote-to-production.sh --yes
```

## Safety rules

- Run inside the repository.
- Keep the working tree clean.
- Preview work happens on `premium-redesign`.
- Production is `main`.
- The promotion script stops if the branches have diverged.
- Never commit secrets, private customer information, API tokens or `.env` files.
