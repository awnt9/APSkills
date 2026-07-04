# AP-Skills

Reusable Agent Skills for Codex and Claude Code.

## Requirements

- Node.js >= 18

## Install skills

Use one command:

```bash
npm run install
```

## Options

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

Install a specific skill:

```bash
npm run install -- --skill fix-pr
```

Install multiple specific skills:

```bash
npm run install -- --skills fix-pr,commits
```

## Validate skills

```bash
npm run validate
```

Validation checks that:

- `skills/` exists.
- Every skill folder contains a `README.md`.
- Every skill `README.md` contains the required sections: `Autor`, `Resumen`, `Cuándo usarla`, `Cuándo no usarla`, `Requisitos previos`, `Cómo usar`.
- Every skill folder contains at least one version folder.
- Every version folder contains a `SKILL.md`.
- No `SKILL.md` is empty.
- Every `SKILL.md` contains a header with the skill name and description.

## Install behavior

The installer always overwrites existing installed skills.

This means that after changing a skill or running `git pull`, you can run the install command again and the installed skills will be updated.

If a skill includes `references/` inside the selected version folder, those files are installed with that skill version. Shared root-level `references/` folders are not installed; keep each version self-contained.

> [!NOTE]
> Installed skills apply after reloading the window or restarting the agent.

## Skill locations

Global install locations:

```txt
Codex:
  ~/.agents/skills

Claude Code:
  ~/.claude/skills
```

Repo-local install locations:

```txt
Codex:
  .agents/skills

Claude Code:
  .claude/skills
```

## Adding a new skill

Create:

```txt
skills/my-new-skill/v1/SKILL.md
```

Then run:

```bash
npm run validate
npm run install -- --agent all --scope user
```

## Skill structure

```txt
skills/
└─ example-skill/
   ├─ README.md
   └─ v1/
      ├─ SKILL.md
      └─ references/
```
