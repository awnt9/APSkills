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
npm run install -- --skill fix-pr
```

Install multiple specific skills:

```bash
npm run install -- --skills fix-pr,commits
```

Validate skills:

```bash
npm run validate
```

## Important behavior

The installer always overwrites existing installed skills.

This is intentional so that running the install command after a `git pull` updates the installed skills.

If a skill includes `references/` inside the selected version folder, those files are installed with that skill version. Shared root-level `references/` folders are not installed; keep each version self-contained.

## Skill rules

Each skill must be a directory inside `skills/`.

Required structure:

```txt
skills/<skill-name>/
├── README.md
└─ v1/
   ├── SKILL.md
   └─ references/   (optional)
```

### Naming

- Skill folder names: lowercase letters, numbers, and hyphens only (`example-skill`, `fix-pr`).
- Version folders: `v1`, `v2`, `v1.0`, etc.
- Default location for new skills: `skills/<skill-name>/v1/SKILL.md`.

### SKILL.md

Each version folder must contain a non-empty `SKILL.md`.

The file must start with this frontmatter and nothing else before the body:

```md
---
name: <skill-name>
description: <one-line description>
---
```

Frontmatter rules:

- `name:` must match the skill folder name.
- `description:` must be a single line summarizing what the skill does and when to use it.
- Do not add extra frontmatter fields.

### README.md

Every skill must have `skills/<skill-name>/README.md` with these headings:

```md
## Autor
## Resumen
## Cuándo usarla
## Cuándo no usarla
## Requisitos previos
## Cómo usar
```

If the author is unknown, use `Pendiente de definir.` under `## Autor`.

## Before finishing changes

Run `npm run validate` and fix any reported issues using the rules above.

Do not commit generated or local-only files.
