---
name: fix-cd-pipeline
description: Diagnose and fix Continuous Deployment pipeline failures using the local repository, GitHub CLI, remote workflows, and deployment logs.
---

# CD Pipeline Fixer

Use this skill when the user asks to fix, debug, inspect, or improve a Continuous Deployment pipeline, deployment workflow, release job, GitHub Actions workflow, environment promotion, container publish, infrastructure deploy, or post-merge deployment failure.

## Language

Always respond to the user in Spanish in the chat, even if logs, code, workflow files, command output, or error messages are in English.

Keep technical identifiers, command names, file paths, workflow names, job names, step names, environment names, branch names, secret names, and code snippets exactly as they appear.

## Core objective

Find the root cause of failed deployments and propose the smallest safe fix.

The agent can inspect:
- The local repository.
- GitHub Actions workflows under `.github/workflows`.
- Remote repository state using `gh`.
- Workflow runs, jobs, logs, annotations, artifacts, PRs, releases, branches, commits, environments, and secrets metadata where available.

Do not guess. Always ground conclusions in local files, workflow definitions, logs, command output, or GitHub metadata.

## Safety rules

Never do any of the following unless the user explicitly asks:
- Push commits.
- Create or merge pull requests.
- Re-run production deployments.
- Modify production secrets.
- Delete branches, tags, releases, artifacts, environments, or workflow runs.
- Force-push.
- Change cloud infrastructure state.

You may edit local files to prepare a fix.

Before changing deployment-sensitive files, briefly explain the intended change.

Deployment-sensitive files include:
- `.github/workflows/**`
- Dockerfiles
- Compose files
- Helm charts
- Terraform/OpenTofu/Pulumi files
- Kubernetes manifests
- release scripts
- package publishing config
- environment config
- migration scripts

## First response behavior

When activated, first determine:
1. What deployment is failing.
2. Which workflow or job failed.
3. Whether the failure is reproducible locally or only in CI/CD.
4. Whether the target is production, staging, preview, or another environment.
5. Whether the latest local branch matches the remote branch involved in the failing run.

Avoid asking the user for information that can be discovered with commands.

## Standard investigation flow

### 1. Inspect repository context

Run safe read-only commands first:

```bash
pwd
git status --short
git branch --show-current
git remote -v
find .github/workflows -maxdepth 1 -type f 2>/dev/null
```

Then inspect likely deployment files:

```bash
ls
find . -maxdepth 3 \( -name "Dockerfile*" -o -name "docker-compose*.yml" -o -name "compose*.yml" -o -name "package.json" -o -name "pnpm-lock.yaml" -o -name "yarn.lock" -o -name "package-lock.json" -o -name "pyproject.toml" -o -name "requirements*.txt" -o -name "go.mod" -o -name "Cargo.toml" -o -name "pom.xml" -o -name "build.gradle*" -o -name "Chart.yaml" -o -name "*.tf" \)
```

### 2. Identify GitHub repository and latest failed runs

Use `gh` when available:

```bash
gh repo view --json nameWithOwner,defaultBranchRef
gh run list --limit 10
gh run list --status failure --limit 10
```

For a specific run:

```bash
gh run view <run-id> --json status,conclusion,name,event,headBranch,headSha,createdAt,updatedAt,url
gh run view <run-id> --log-failed
```

If the failing workflow is known:

```bash
gh run list --workflow "<workflow-name-or-file>" --limit 10
```

### 3. Compare local, remote, and failing commit

Check whether the local workspace matches the failing run:

```bash
git fetch --all --prune
git rev-parse HEAD
git rev-parse origin/$(git branch --show-current)
git log --oneline --decorate -n 10
```

If the failed run used another branch or SHA, inspect that commit before making conclusions.

### 4. Analyze workflow logic

For each relevant workflow, inspect:
- `on:` triggers.
- `permissions:`.
- `concurrency:`.
- `environment:`.
- branch/path filters.
- job dependencies through `needs:`.
- matrix strategy.
- build, test, publish, deploy, and smoke-test steps.
- secret and variable references.
- artifact upload/download paths.
- cache keys.
- Docker image tags.
- deployment target selection.
- use of third-party actions and pinned versions.

Prefer minimal fixes over rewrites.

### 5. Classify the failure

Classify the issue into one or more categories:

- YAML syntax or GitHub Actions expression error.
- Missing or incorrect secret/variable.
- Permission issue, usually `GITHUB_TOKEN` permissions.
- Branch/environment protection issue.
- Dependency install failure.
- Build failure.
- Test failure blocking deploy.
- Docker build or registry push failure.
- Artifact path mismatch.
- Version/tag calculation failure.
- Migration failure.
- Infra provisioning failure.
- Cloud authentication failure.
- Deployment command failure.
- Runtime health check failure.
- Rollout timeout.
- Environment-specific config mismatch.
- Race condition or concurrency issue.

## Fix strategy

Apply the smallest safe local patch.

Good fixes:
- Correct a broken path.
- Add required `permissions`.
- Fix artifact names and paths.
- Fix branch/environment conditions.
- Pin or update a broken action version when justified by logs.
- Add missing install/build step.
- Correct Docker build context.
- Correct image tag propagation.
- Add explicit shell safety where useful.
- Improve logging around opaque deployment steps.
- Add preflight validation for required variables.
- Fix cache misuse if it causes stale or missing dependencies.

Avoid:
- Broad rewrites.
- Silencing failing tests.
- Disabling deployment gates.
- Removing environment protections.
- Hardcoding secrets.
- Masking errors with `|| true`, unless clearly justified for non-critical cleanup.
- Re-running production blindly.

## Validation

After editing, validate locally where possible:

```bash
git diff --check
```

If workflow YAML changed, validate syntax:

```bash
python - <<'PY'
import sys, pathlib, yaml
for p in pathlib.Path(".github/workflows").glob("*.*ml"):
    try:
        yaml.safe_load(p.read_text())
        print(f"OK {p}")
    except Exception as e:
        print(f"FAIL {p}: {e}")
        sys.exit(1)
PY
```

If `actionlint` is installed:

```bash
actionlint
```

Run relevant project checks discovered from the repo:
- package manager install/build/test
- Docker build
- unit tests
- lint
- deployment script dry-run if available

Do not invent commands. Prefer commands documented in README, package scripts, Makefile, CI workflow, or project config.

## GitHub Actions commands reference

Useful read-only commands:

```bash
gh workflow list
gh workflow view <workflow>
gh run list --limit 20
gh run view <run-id>
gh run view <run-id> --log
gh run view <run-id> --log-failed
gh run download <run-id>
gh api repos/:owner/:repo/actions/runs/<run-id>/jobs
gh pr list --state open --limit 20
gh pr view <number>
gh release list --limit 20
gh secret list
gh variable list
```

Use `gh secret list` and `gh variable list` only to confirm names and presence. Never print secret values.

## Output format

When reporting back, use this structure:

1. **Root cause**
   - State the specific cause.
   - Mention the exact workflow/job/step/file involved.

2. **Evidence**
   - Quote or summarize the relevant log lines or config lines.
   - Include command outputs when useful.

3. **Fix applied**
   - List the files changed.
   - Explain why the change is minimal and safe.

4. **Validation**
   - List commands run and results.
   - If something could not be validated, say so clearly.

5. **Next action**
   - Recommend whether to commit, open a PR, or re-run a workflow.
   - For production deploys, ask for explicit confirmation before triggering anything.

## Escalation

If the failure is caused by missing credentials, expired cloud tokens, protected environment approvals, unavailable external services, or secrets the agent cannot inspect, stop and explain exactly what the user needs to verify manually.

Do not fabricate access to secrets, cloud consoles, or deployment platforms.
