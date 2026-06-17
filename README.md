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
```

Defaults:

```txt
--agent all
--scope user
--version latest
```

## Validate skills

```bash
npm run validate
```

Validation checks that:

- `skills/` exists.
- Every skill folder contains at least one version folder.
- Every version folder contains a `SKILL.md`.
- No `SKILL.md` is empty.

## Install behavior

The installer always overwrites existing installed skills.

This means that after changing a skill or running `git pull`, you can run the install command again and the installed skills will be updated.

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
      ├─ scripts/
      ├─ references/
      └─ assets/
```
