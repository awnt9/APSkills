# AGENTS.md

## Project purpose

This repository contains reusable Agent Skills.

Skills live in:

```txt
skills/<skill-name>/<version>/SKILL.md
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
--version <version>|latest
--skill|--skills <skill-name>[,<skill-name>]
```

Defaults:

```txt
--agent all
--scope user
--version latest
skills: all
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

Install a specific skill version:

```bash
npm run install -- --agent all --scope user --version v1
```

Install a specific skill:

```bash
npm run install -- --skill prepare-skill
```

Install multiple specific skills:

```bash
npm run install -- --skills prepare-skill,fix-pr
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
<version>/SKILL.md
```

Recommended structure:

```txt
skills/
└─ example-skill/
   ├─ README.md
   └─ v1/
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

- Every skill has a `README.md`.
- Every skill `README.md` contains: `Autor`, `Resumen`, `Cuándo usarla`, `Cuándo no usarla`, `Requisitos previos`, `Cómo usar`.
- Every skill has a versioned `SKILL.md`.
- Every skill has at least one version folder such as `v1`.
- No `SKILL.md` is empty.
- Skill names are stable and lowercase.
- No generated or local-only files are committed.
