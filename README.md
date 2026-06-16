# AP-Skills

Reusable Agent Skills for Codex and Claude Code.

## Requirements

- Node.js >= 18

## Install skills

Use one command:

```bash
npm run install -- --agent all --scope user
```

## Options

```txt
--agent codex|claude|all
--scope user|repo
```

Defaults:

```txt
--agent all
--scope user
```

## Validate skills

```bash
npm run validate
```

Validation checks that:

- `skills/` exists.
- Every skill folder contains a `SKILL.md`.
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
skills/my-new-skill/SKILL.md
```

Then run:

```bash
npm run validate
npm run install -- --agent all --scope user
```
