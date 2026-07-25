# Contributing to Sonic

Thanks for contributing to Sonic! Please follow these guidelines to keep the
codebase clean and the team productive.

## Engineering Workflow

See the full engineering workflow in the team docs. Key points:

- **Always branch from `staging`** — never from `main`.
- **Branch format**: `feature/SON-<number>-short-description` (or `fix/`, `chore/`).
- **Commit format**: `SON-<number>: short description of the change`.
- **PR title format**: `[SON-<number>] Short description of the change`.
- **PR base**: `staging`.
- Never push directly to `main` or `staging`.
- Keep commits small and focused.
- Open PRs early — Draft PRs are encouraged.

## Secret Scanning

This repository uses [Gitleaks](https://github.com/gitleaks/gitleaks) to
automatically scan for accidentally committed secrets (API keys, passwords,
tokens, etc.). The scan runs on every push and pull request.

### How It Works

| Trigger | What it scans | Speed |
|---------|--------------|-------|
| Push / PR to `staging` or `main` | Latest commit diff only | Fast (~10s) |
| Weekly schedule (Monday 03:00 UTC) | Full repository history | Slower |

Configuration lives in [`.gitleaks.toml`](.gitleaks.toml) at the repo root.

### If a Secret Is Flagged

> **⚠️ Removing the commit is NOT enough.** If a secret was pushed — even
> briefly — assume it has been compromised.

Follow these steps immediately:

1. **Rotate the credential.** Go to the provider (AWS, Anthropic, HuggingFace,
   MinIO, etc.) and revoke the exposed key.
2. **Issue a new key** and update your `.env` / secrets manager / CI secrets.
3. **Remove the secret from the codebase.** Use `git rebase -i` or a new
   commit to remove the value. Never just delete the file — the secret is still
   in Git history.
4. **Notify the team.** Post in the team channel so others know the key has
   been rotated.

### Allowlisted Files

The following files are excluded from scanning (configured in `.gitleaks.toml`):

- **`.env.example`** — Contains placeholder values (e.g. `sonic-secret`,
  `change-me-in-prod`) that are intentionally committed as developer docs.

If you add a new example config with placeholder credentials, add its path to
the `[allowlist]` in `.gitleaks.toml`.

### Running Locally

You can run gitleaks locally before pushing to catch issues early:

```bash
# Install (macOS)
brew install gitleaks

# Install (Linux)
# Download from https://github.com/gitleaks/gitleaks/releases

# Scan the repo
gitleaks detect --source . -v

# Scan only your staged changes
gitleaks protect --source . -v
```

### False Positives

If gitleaks flags something that is **not** a real secret:

1. First, confirm it's genuinely safe (not a real credential).
2. Add the file path to the `[allowlist].paths` array in `.gitleaks.toml`.
3. Or, for a specific known string, add a `[[rules]]` override with a
   `[rules.allowlist]` in `.gitleaks.toml`.

Do **not** disable rules globally — use targeted allowlists.

## Code Review

- At least one approval is required before merging.
- All CI checks must pass (lint, build, secret scan).
- Use the PR description to explain *why*, not just *what*.
