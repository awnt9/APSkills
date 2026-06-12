# AGENTS.md

## Project purpose

This repository contains reusable Agent Skills.

Skills live in:

```txt
skills/<skill-name>/SKILL.md
```

## Supported agents

Currently supported targets:

- Codex
- Claude Code

## Main command

Install skills:

```bash
npm run install -- --agent all --scope user
```

Options:

```txt
--agent codex|claude|all
--scope user|repo
```

Defaults:

```txt
--agent all
--scope user
```

## Examples

Install all skills globally:

```bash
npm run install -- --agent all --scope user
```

Install only Codex skills globally:

```bash
npm run install -- --agent codex --scope user
```

Install only Claude skills inside this repo:

```bash
npm run install -- --agent claude --scope repo
```

Validate skills:

```bash
npm run validate
```

## Important behavior

The installer always overwrites existing installed skills.

This is intentional so that running the install command after a `git pull` updates the installed skills.

## Skill rules

Each skill must be a directory inside `skills/`.

Each skill must include:

```txt
SKILL.md
```

Recommended structure:

```txt
skills/
└─ example-skill/
   ├─ SKILL.md
   ├─ scripts/
   ├─ references/
   └─ assets/
```

## Before finishing changes

Run:

```bash
npm run validate
```

Check that:

- Every skill has a `SKILL.md`.
- No `SKILL.md` is empty.
- Skill names are stable and lowercase.
- No generated or local-only files are committed.
