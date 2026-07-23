# SON — Engineering Workflow

Follow this for every task, every sprint.

## 1. Clone Repository (first time only)

```bash
git clone https://github.com/Bad-Vibe-Coders/Sonic.git
cd Sonic
```

## 2. Configure Git (first time only)

```bash
git config --global user.name "YOUR_NAME"
git config --global user.email "YOUR_EMAIL"
git config --global --list
```

## 3. Sync with `staging`

```bash
git checkout staging
git pull origin staging
```

> **Always branch from `staging`. Never branch from `main`.**

## 4. Pick Up Your Jira Issue

Find your assigned issue in the current sprint board (e.g. **SON-8**, **SON-15**, **SON-24**).
Move it to **In Progress** in Jira before you start.

Every branch, commit, and PR must include the Jira key.

## 5. Create Feature Branch

Format:

```text
feature/SON-<number>-short-description
```

Example:

```bash
git checkout -b feature/SON-8-auth-service
```

## 6. Do the Work

Commit as you go, keeping commits small and focused.

```bash
git add .
git commit -m "SON-8: short description of the change"
```

## 7. Push

```bash
git push origin feature/SON-8-auth-service
```

## 8. Open Pull Request

**Base:** `staging`

**Title**

```text
[SON-8] Short description of the change
```

Open the PR early — Draft PRs are encouraged so the team can see work in progress.
Move the Jira issue to **In Review**.

## 9. After Merge

* Delete the feature branch (locally and on GitHub).
* Move the Jira issue to **Done**.
* Pull latest `staging` before starting your next task.

---

# Engineering Rules

* Never push directly to `main` or `staging`.
* Every branch, commit, and PR must reference a Jira issue.
* Open PRs early (Draft PRs are encouraged).
* Keep commits small and focused.
* Pull the latest `staging` before starting new work.
* Use Pull Requests for all code changes — at least one approval required before merging.
