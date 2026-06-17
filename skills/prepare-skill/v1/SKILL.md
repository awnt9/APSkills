---
name: prepare-skill
description: Normalize Agent Skill drafts inside the AP-Skills repository so they pass validation.
---

# prepare-skill

Helps convert a skill in any intermediate state into a valid skill for this repository.

## Language

Always respond to the user in Spanish in the chat, even if skill content, command output, validation errors, file paths, or code snippets are in English.

Keep technical identifiers, command names, file paths, version folder names, skill names, and code snippets exactly as they appear.

## Objective

Fit skill drafts into the expected structure:

```txt
skills/<skill-name>/
├── README.md
└── v1/
    └── SKILL.md
```

The priority is to make the skill pass `npm run validate` without rewriting the functional content provided by the user.

## Preservation Rules

- Do not change the body of the skill created by the user.
- You may only modify the skill content to add or correct the YAML frontmatter in `SKILL.md`.
- If the file already has useful body content, preserve it in the same order and with the same text.
- If the file has incomplete or incorrect frontmatter, replace only that frontmatter with valid frontmatter and leave the body intact.
- Do not change internal instructions, examples, commands, lists, tool names, or wording in the skill body.
- Do not stage, commit, or push unless the user explicitly asks.
- Do not delete files unless you have clearly identified them as the draft moved into the final structure.

## Flow

### 1. Inspect the state

Start with read-only commands:

```bash
git status --short
git diff --name-status
git diff --staged --name-status
git ls-files --others --exclude-standard
find skills -maxdepth 3 -type f | sort
```

Read candidate files with `sed` or an equivalent tool.

### 2. Detect skill candidates

Consider these candidates:

- New `.txt` or `.md` files that contain skill instructions.
- Files named `SKILL.md` outside `skills/<skill-name>/<version>/`.
- Folders inside `skills/` without a `README.md`.
- Folders inside `skills/` without a version folder such as `v1`.
- Folders with `skills/<skill-name>/SKILL.md` at the root.
- Skills whose `SKILL.md` does not have valid YAML frontmatter.
- Skills whose `README.md` is missing or lacks required sections.

If there are several independent candidates and it is unclear whether they belong to the same skill, ask before mixing them.

### 3. Choose name and destination

Choose the skill name in this order:

1. The folder name if the file is already inside `skills/<skill-name>/`.
2. The `name:` field if clear YAML frontmatter exists.
3. The file name, normalized to lowercase with hyphens.
4. A short proposal based on the content, only if the previous options do not exist.

The name must use only lowercase letters, numbers, and hyphens.

Use this default destination for new skills:

```txt
skills/<skill-name>/v1/SKILL.md
```

If the user already created a valid version folder, keep that version.

### 4. Move or create the structure

Before editing, briefly explain what you are going to move or create.

Make the necessary changes:

- Create `skills/<skill-name>/` if it does not exist.
- Create `skills/<skill-name>/v1/` if there is no valid version.
- If the draft is a `.txt` file, convert it to `SKILL.md` when moving it to the destination.
- If the draft is a `.md` file with another name, move it or copy its content to `SKILL.md` depending on context.
- If `skills/<skill-name>/SKILL.md` exists, move it to `skills/<skill-name>/v1/SKILL.md`.
- Do not overwrite an existing `SKILL.md` with different content without asking for confirmation.

### 5. Fix `SKILL.md` frontmatter

The final file must start exactly with:

```md
---
name: <skill-name>
description: <one-line description>
---
```

To generate the `description`, summarize what the skill does and when it should be used based only on the visible content of the file.

Rules:

- Keep `name:` equal to the chosen folder name.
- Keep `description:` on a single line.
- Do not add extra fields to the frontmatter.
- If frontmatter is missing, insert it above the existing body.
- If frontmatter exists but is invalid, correct it and preserve the body.

### 6. Create or complete `README.md`

Every skill must have:

```txt
skills/<skill-name>/README.md
```

The README must include these headings:

```md
## Autor
## Resumen
## Cuándo usarla
## Cuándo no usarla
## Requisitos previos
## Cómo usar
```

If the README is missing, create it with brief text inferred from the skill.

If it exists, preserve its content and add any missing sections. If a required section is empty, fill it with one brief line.

Use `Pendiente de definir.` for `Autor` when there is no clear author.

### 7. Validate and correct

Run:

```bash
npm run validate
```

If it fails, correct only what is necessary to pass validation:

- Folder names.
- Location `skills/<skill-name>/<version>/SKILL.md`.
- YAML frontmatter.
- Missing README or required README sections.

Run `npm run validate` again until it passes or until you find a real blocker.

## Expected Output

When finished, report:

- Final `SKILL.md` path.
- Final `README.md` path.
- Whether any original file was moved or renamed.
- Result of `npm run validate`.
- Any inferred decision, such as name or description.

## Special Cases

- If the draft contains several skills in a single file, ask before splitting them.
- If the content does not look like a skill, warn the user and ask for confirmation before moving it.
- If there is a collision with an existing skill, ask for confirmation before overwriting.
- If the user asks to create a new version, use the indicated version instead of `v1`.
