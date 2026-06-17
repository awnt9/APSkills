---
name: best-practices-deployment
description: makes a preventive deployment best-practices review for repositories that deploy applications using Docker, Docker Compose, and GitHub Actions. The goal is to identify deployment risks before they fail in production and suggest structural improvements across workflows, Dockerfiles, Compose files, environment configuration, scripts, documentation, and application code when relevant.
---

# docker-compose-github-actions-deployment-review

## Language

Always respond to the user in Spanish in the chat, even if logs, code, workflow files, command output, or error messages are in English.

Keep technical identifiers, command names, file paths, workflow names, job names, step names, environment names, branch names, secret names, and code snippets exactly as they appear.

## Purpose

Use this skill to perform a preventive deployment best-practices review for repositories that deploy applications using Docker, Docker Compose, and GitHub Actions.

The goal is not to patch a failing workflow. The goal is to review the repository as a whole, identify deployment risks before they fail in production, and suggest structural improvements across workflows, Dockerfiles, Compose files, environment configuration, scripts, documentation, and application code when relevant.

## When to Use

Use this skill when the user asks to:

* Review a deployment setup.
* Improve deployment best practices.
* Audit GitHub Actions deployment workflows.
* Review Docker Compose based deployments.
* Check whether a repository is ready to deploy.
* Simplify or harden deployment automation.
* Detect hidden deployment risks before running CD.
* Refactor deployment logic spread across workflows, shell commands, Dockerfiles, Compose files, or app code.

Do not use this skill only as a log-fixing tool. If the user provides a failed workflow log, first identify the immediate failure, then also review whether the deployment design should be improved rather than merely patched.

## Repository Scope

Always inspect the deployment as a system, not as a single file.

Review at least:

* `.github/workflows/*`
* `Dockerfile`, `Dockerfile.*`
* `docker-compose.yml`, `compose.yml`, override files, and production compose files
* `.dockerignore`
* `.env.example`, environment documentation, and config templates
* Deployment scripts such as `deploy.sh`, `scripts/*`, `Makefile`
* Application startup commands and health endpoints
* Package manager scripts such as `package.json`, `pyproject.toml`, `pom.xml`, `go.mod`, etc.
* README or deployment documentation
* Any reverse proxy, volumes, migrations, or seed scripts involved in deployment

If one of these files is missing, say whether it is acceptable or whether its absence creates deployment risk.

## Review Principles

Prefer structural fixes over patches.

A good deployment should be:

* Simple to understand.
* Reproducible.
* Explicit about build, configuration, release, and runtime responsibilities.
* Safe to rerun.
* Easy to roll back.
* Clear about where secrets and environment variables come from.
* Consistent across Dockerfile, Compose, workflow, and application code.
* Observable enough to detect failure quickly.
* Small enough that the workflow does not become an unreadable shell script.

## Analysis Workflow

### 1. Map the deployment flow

Determine:

* What triggers deployment.
* What branch, tag, or manual event deploys.
* What image is built.
* Where the image is pushed.
* How the remote server receives the new version.
* How Docker Compose is updated or restarted.
* Which environment variables and secrets are required.
* Whether database migrations or other one-time release steps run.
* How success or failure is detected.

Summarize this flow in plain language before giving recommendations.

### 2. Check responsibility boundaries

Look for deployment logic in the wrong place.

Prefer:

* Dockerfile defines how the app image is built.
* Compose defines runtime services, networks, volumes, env files, health checks, and restart policy.
* GitHub Actions orchestrates build, test, publish, transfer, and remote deployment.
* Shell scripts contain reusable deployment commands when they are too long for YAML.
* Application code exposes health checks and handles graceful shutdown.

Flag cases where:

* GitHub Actions contains long inline shell blocks that should be scripts.
* Image build commands are manually reconstructed in the workflow instead of using a Dockerfile.
* Runtime environment mapping is hidden in ad-hoc shell commands.
* Compose files contain build-time concerns.
* App code assumes local-only paths, ports, or environment names.
* Deployment behavior depends on undocumented manual server state.

### 3. Review GitHub Actions

Check for:

* Clear trigger strategy.
* `workflow_dispatch` for manual deployments when appropriate.
* `concurrency` to avoid overlapping deployments.
* Minimal permissions using `permissions`.
* Pinned or versioned actions.
* Separate jobs for test, build, publish, and deploy when useful.
* Build cache usage.
* Clear environment selection.
* GitHub Environments for production deployments when appropriate.
* Secrets only from GitHub Secrets or environment secrets.
* No secrets printed in logs.
* No unnecessary long-lived credentials.
* No deployment from untrusted pull request contexts.
* Explicit failure behavior with `set -euo pipefail` in shell scripts.
* Clear SSH handling if deploying to a server.
* Known hosts verification instead of disabling SSH checks.
* Artifact or image tag traceability back to commit SHA.
* No reliance on mutable `latest` tags alone for production.
* Remote commands that are idempotent and safe to rerun.

### 4. Review Dockerfile

Check for:

* Appropriate base image with explicit version.
* Multi-stage build when it reduces image size or separates build/runtime dependencies.
* `.dockerignore` present and effective.
* Dependency installation optimized for layer caching.
* No secrets copied into the image.
* No unnecessary dev dependencies in runtime image.
* Non-root user where practical.
* Explicit working directory.
* Clear startup command.
* Healthcheck when useful.
* Reasonable image size.
* Build arguments only for build-time values, not runtime secrets.
* No hardcoded environment-specific values.

### 5. Review Docker Compose

Check for:

* Production-appropriate compose file.
* Image reference strategy using immutable tags or commit SHAs.
* Clear service names.
* Restart policies.
* Health checks for app and dependent services.
* `depends_on` used with awareness that it does not guarantee full readiness unless health conditions are configured.
* Volumes only where needed.
* Persistent data clearly separated from ephemeral containers.
* Network exposure minimized.
* Only required ports published.
* Environment variables loaded consistently.
* Secrets not committed.
* Resource limits or operational constraints when appropriate.
* Reverse proxy labels/configuration if relevant.
* Migration or one-off tasks not mixed unsafely with normal app startup.
* No local-development-only settings used in production.

### 6. Review environment configuration

Check for:

* `.env.example` or equivalent documentation.
* Consistent names across app code, Compose, workflows, and docs.
* No unnecessary remapping between different variable names.
* Required variables documented.
* Safe defaults for local development.
* No production secrets committed.
* Clear distinction between build-time and runtime variables.
* Validation of required environment variables at app startup when possible.

### 7. Review release safety

Check whether the deployment has:

* A clear rollback path.
* Image tags that allow reverting.
* Database migration strategy.
* Backup considerations for persistent data.
* Graceful container replacement.
* Health check or smoke test after deployment.
* Failure detection after `docker compose up`.
* Logs available after deployment.
* A way to identify which commit is currently deployed.

### 8. Review maintainability

Flag:

* Long YAML commands that should become scripts.
* Repeated logic across workflows.
* Complex escaping or nested SSH heredocs.
* Hidden assumptions about server directories.
* Undocumented manual setup.
* Inconsistent naming.
* Duplicate environment definitions.
* Compose files that mix development and production concerns.
* Deployment steps that are hard to test locally.

## Output Format

Respond with the following sections:

### Deployment flow found

Explain the current deployment flow in 5-10 bullet points.

### Main risks

List the most important risks first. For each risk include:

* Severity: High, Medium, or Low.
* File or area affected.
* Why it matters.
* Suggested improvement.

### Best-practice recommendations

Group recommendations by:

* GitHub Actions
* Dockerfile
* Docker Compose
* Environment variables and secrets
* Release safety
* Maintainability

### Quick wins

Give a short list of changes that are small but high-impact.

### Structural improvements

Give deeper refactors that would improve the deployment design.

### Suggested target architecture

Describe the desired deployment shape, for example:

* Workflow tests the app.
* Workflow builds image from Dockerfile.
* Workflow tags image with commit SHA.
* Workflow pushes image to registry.
* Workflow connects to the server.
* Server pulls the immutable image tag.
* Docker Compose restarts services.
* Health check or smoke test verifies deployment.
* Rollback uses the previous image tag.

### Optional patches

Only provide code patches if the user asks for implementation or if the fix is obvious and low-risk.

When providing patches, prefer small changes and explain why they improve the deployment design.

## Decision Rules

* Do not only fix the visible symptom.
* Do not recommend adding complexity unless it solves a real risk.
* Do not assume the workflow file is the only deployment source of truth.
* Do not ignore Dockerfile or Compose issues just because the GitHub Actions workflow can work around them.
* Do not normalize bad patterns because they currently deploy successfully.
* Prefer fewer moving parts.
* Prefer explicit configuration over implicit server state.
* Prefer immutable image tags over mutable-only deployment tags.
* Prefer scripts for long deployment commands.
* Prefer documented environment contracts over variable remapping.
* Prefer idempotent deploy commands.
* Prefer actionable recommendations over generic DevOps advice.

## Final Checklist

Before finishing, verify whether the repository has:

* A Dockerfile suitable for production.
* A Compose file suitable for production.
* A clear image tagging strategy.
* A clear secret and environment variable strategy.
* A deploy workflow with concurrency protection.
* Minimal GitHub token permissions.
* No committed secrets.
* A `.dockerignore`.
* Health checks or smoke tests.
* Rollback instructions.
* Deployment documentation.
* No excessive inline shell in workflow YAML.
* No unnecessary variable remapping.
* No dependence on undocumented manual server state.
