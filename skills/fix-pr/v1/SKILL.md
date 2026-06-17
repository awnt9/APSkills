---
name: fix-pr
description: Diagnose failed GitHub Pull Requests by inspecting checks, CI logs, and diffs, then propose conservative fixes and only edit after explicit approval.
---

# fix-pr

Diagnose a failed GitHub Pull Request, reason about the cause, and only make safe minor fixes after explicit approval.

## Language

Always respond to the user in Spanish in the chat, even if logs, code, workflow files, command output, or error messages are in English.

Keep technical identifiers, command names, file paths, workflow names, job names, step names, environment names, branch names, secret names, and code snippets exactly as they appear.

## Purpose

Use this skill when the user has a Pull Request that failed checks, tests, linting, typechecking, or CI.

The goal is to:

1. Inspect the failed PR.
2. Understand why it failed.
3. Classify the issue as minor or major.
4. For minor non-logic changes, propose a fix and ask before editing.
5. For major or logic-affecting changes, explain the fix to the user without touching code.

## Required behavior

You must be conservative.

Before modifying any file, always ask the user for confirmation.

Before running any command that creates a lasting change in the repository or remote GitHub state, always ask the user for confirmation.

This includes, but is not limited to:

- `git commit`
- `git push`
- `git reset --hard`
- `git clean`
- `gh pr create`
- `gh pr merge`
- `gh pr close`
- `gh pr edit`
- `gh workflow run`
- package manager commands that modify lockfiles
- code formatters that rewrite files
- migrations or code generators that write files

Never create, update, push, merge, or close a PR automatically.

## Allowed commands without confirmation

You may run read-only diagnostic commands without asking first.

Examples:

```bash
git status
git branch --show-current
git log --oneline -n 10
git diff
git diff --stat
gh pr view
gh pr diff
gh pr checks
gh run list
gh run view
```

You may also inspect files using read-only commands such as:

```bash
cat
sed
grep
rg
find
ls
```

## Commands requiring confirmation

Ask before running commands that may modify files, dependencies, git history, or remote state.

Examples:

```bash
npm install
pnpm install
yarn install
bun install
npm run format
pnpm format
prettier --write .
eslint --fix .
git add
git commit
git push
gh pr edit
gh pr create
gh pr merge
```

If unsure whether a command modifies anything, ask first.

## Workflow

### 1. Identify the PR

If the PR number or URL is provided, use it.

If not provided, try to infer the current PR from the checked-out branch using:

```bash
gh pr view
```

If no PR can be inferred, ask the user for the PR number or URL.

### 2. Inspect PR status

Collect PR metadata and failing checks:

```bash
gh pr view --json number,title,body,headRefName,baseRefName,author,mergeStateStatus,statusCheckRollup
gh pr checks
```

If needed, inspect CI runs:

```bash
gh run list
gh run view
```

### 3. Inspect the code changes

Review the PR diff:

```bash
gh pr diff
```

Also inspect local changes if relevant:

```bash
git status
git diff
```

Focus on changed files and nearby code. Do not perform broad refactors.

### 4. Diagnose the failure

Explain the likely root cause clearly.

Use evidence from:

- failed check names
- CI logs
- test output
- lint/typecheck errors
- changed files
- existing project patterns
- package scripts
- `AGENTS.md` or other repo instructions

Avoid guessing. If the evidence is insufficient, say what is missing and what command or information would help.

### 5. Classify the fix

Classify the issue as one of:

#### Minor safe fix

A fix may be considered minor only if it does not change business logic or application behavior.

Examples:

- formatting-only fix
- typo in documentation
- lint rule fix that preserves behavior
- import ordering
- unused import removal
- test snapshot update only when clearly caused by intentional UI/text output changes
- fixing a type annotation without changing runtime behavior
- correcting a missing semicolon, trailing comma, or style issue
- updating a test description or assertion message without changing the test logic

For minor safe fixes:

1. Explain the proposed change.
2. Ask the user before editing.
3. Only edit after explicit approval.
4. Run relevant checks if they are read-only or ask before running commands that may write files.
5. Summarize the result.

#### Major or logic-affecting fix

A fix is major if it changes application behavior, business logic, data flow, security, permissions, API behavior, database schema, dependency versions, or test meaning.

Examples:

- changing production logic
- changing API contracts
- changing database queries or migrations
- modifying authentication or authorization
- changing error handling behavior
- altering test assertions to make tests pass
- adding or removing dependencies
- changing build configuration
- large refactors
- changes where the intended behavior is ambiguous

For major fixes:

1. Do not edit code.
2. Explain the root cause.
3. Explain the recommended fix.
4. Point to the files or functions likely involved.
5. Provide a suggested patch or pseudocode only if useful.
6. Ask the user whether they want you to proceed.

## Approval protocol

When a code change may be needed, respond with:

```text
I found a possible minor and safe fix.

Cause:
...

Proposed change:
...

Files I would touch:
...

Do you want me to apply it?
```

Do not edit until the user clearly approves.

When a command may create persistent changes, respond with:

```text
This command may modify the repository or remote state:

<command>

Reason:
...

Do you want me to run it?
```

Do not run it until the user clearly approves.

## Safety rules

- Never commit without explicit approval.
- Never push without explicit approval.
- Never merge without explicit approval.
- Never close or edit the PR without explicit approval.
- Never rewrite git history without explicit approval.
- Never run destructive git commands without explicit approval.
- Never hide failing checks.
- Never change tests just to make them pass unless the test itself is clearly incorrect and the user approves.
- Never make broad refactors while diagnosing a PR failure.
- Prefer minimal changes.
- Preserve the user's intent and existing code style.
- If the correct fix is ambiguous, stop and explain the options.

## Final response format

After diagnosis, report:

```text
Diagnosis:
...

Likely cause:
...

Fix type:
- Minor safe fix / Major logic-affecting fix / Unclear

What I would do:
...

Files involved:
...

Commands reviewed:
...

Status:
...
```

If code was changed after approval, also include:

```text
Changes applied:
...

Checks run:
...

Result:
...
```

If no code was changed, clearly say:

```text
I did not touch code.
```
