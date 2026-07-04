import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const repoRoot = path.resolve(__dirname, "..", "..");
export const skillsDir = path.join(repoRoot, "skills");
export const DEFAULT_VERSION = "latest";

const REQUIRED_README_SECTIONS = [
  "Autor",
  "Resumen",
  "Cuándo usarla",
  "Cuándo no usarla",
  "Requisitos previos",
  "Cómo usar"
];

export function fail(message) {
  console.error(`Error: ${message}`);
  process.exit(1);
}

export function readOptionValue(argv, index, optionName) {
  const value = argv[index];

  if (!value || value.startsWith("--")) {
    fail(`Missing value for ${optionName}`);
  }

  return value;
}

export function parseSkillNameList(value, optionName) {
  const skillNames = value
    .split(",")
    .map((skillName) => skillName.trim())
    .filter(Boolean);

  if (skillNames.length === 0) {
    fail(`Missing value for ${optionName}`);
  }

  return skillNames;
}

export function validateSkillNameOptions(skillNames) {
  for (const skillName of skillNames) {
    if (!isSkillName(skillName)) {
      fail(`Invalid --skill "${skillName}". Skill names must use lowercase letters, numbers, and hyphens`);
    }
  }
}

export function isSkillName(name) {
  return /^[a-z0-9-]+$/.test(name);
}

export function isVersionName(name) {
  return /^v\d+(?:\.\d+)*$/.test(name);
}

function compareVersions(a, b) {
  const aParts = a.slice(1).split(".").map(Number);
  const bParts = b.slice(1).split(".").map(Number);
  const maxLength = Math.max(aParts.length, bParts.length);

  for (let i = 0; i < maxLength; i++) {
    const aPart = aParts[i] ?? 0;
    const bPart = bParts[i] ?? 0;

    if (aPart !== bPart) return aPart - bPart;
  }

  return a.localeCompare(b);
}

function getSkillNames(requestedSkillNames = []) {
  if (!fs.existsSync(skillsDir)) {
    fail(`Missing skills directory: ${skillsDir}`);
  }

  const availableSkillNames = fs
    .readdirSync(skillsDir, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .sort();

  if (requestedSkillNames.length === 0) {
    return availableSkillNames;
  }

  const availableSkillNameSet = new Set(availableSkillNames);
  const missingSkillNames = requestedSkillNames.filter(
    (skillName) => !availableSkillNameSet.has(skillName)
  );

  if (missingSkillNames.length > 0) {
    fail(
      `Skill(s) not found: ${missingSkillNames.join(", ")}. Available skills: ${availableSkillNames.join(", ")}`
    );
  }

  return requestedSkillNames;
}

function getSkillVersionNames(skillName) {
  const skillPath = path.join(skillsDir, skillName);

  return fs
    .readdirSync(skillPath, { withFileTypes: true })
    .filter((entry) => entry.isDirectory() && isVersionName(entry.name))
    .map((entry) => entry.name)
    .sort(compareVersions);
}

function normalizeYamlValue(value) {
  return value?.trim().replace(/^["']|["']$/g, "");
}

function validateSkillFrontmatter(skillLabel, expectedSkillName, content, errors) {
  const lines = content.replace(/^\uFEFF/, "").split(/\r?\n/);
  const name = normalizeYamlValue(lines[1]?.match(/^name:\s*(.+)$/)?.[1]);
  const hasRequiredFrontmatter =
    lines[0] === "---" &&
    /^name:\s*\S/.test(lines[1] ?? "") &&
    /^description:\s*\S/.test(lines[2] ?? "") &&
    lines[3] === "---";

  if (!hasRequiredFrontmatter) {
    errors.push(
      `${skillLabel}: SKILL.md must start with frontmatter: ---, name:, description:, ---`
    );
  }

  if (name && name !== expectedSkillName) {
    errors.push(`${skillLabel}: SKILL.md name "${name}" must match skill folder "${expectedSkillName}"`);
  }
}

function getMarkdownHeadings(content) {
  return new Set(
    content
      .replace(/^\uFEFF/, "")
      .split(/\r?\n/)
      .map((line) => line.match(/^#{1,6}\s+(.+?)\s*#*\s*$/)?.[1]?.trim())
      .filter(Boolean)
  );
}

function validateSkillReadme(skillName, errors) {
  const readmeFile = path.join(skillsDir, skillName, "README.md");

  if (!fs.existsSync(readmeFile)) {
    errors.push(`${skillName}: missing README.md`);
    return;
  }

  const rawContent = fs.readFileSync(readmeFile, "utf8");
  const content = rawContent.trim();

  if (!content) {
    errors.push(`${skillName}: README.md is empty`);
    return;
  }

  const headings = getMarkdownHeadings(rawContent);
  const missingSections = REQUIRED_README_SECTIONS.filter((section) => !headings.has(section));

  if (missingSections.length > 0) {
    errors.push(
      `${skillName}: README.md missing required section(s): ${missingSections.join(", ")}`
    );
  }
}

export function validateSkills(requestedSkillNames = []) {
  const skillNames = getSkillNames(requestedSkillNames);

  if (skillNames.length === 0) {
    console.log("No skills found in ./skills yet.");
    return [];
  }

  const errors = [];
  const skills = [];

  for (const skillName of skillNames) {
    if (!isSkillName(skillName)) {
      errors.push(`${skillName}: skill names must use lowercase letters, numbers, and hyphens`);
    }

    validateSkillReadme(skillName, errors);

    const versionNames = getSkillVersionNames(skillName);

    if (versionNames.length === 0) {
      errors.push(`${skillName}: missing version directory, for example v1/SKILL.md`);
      continue;
    }

    for (const versionName of versionNames) {
      const skillLabel = `${skillName}@${versionName}`;
      const skillFile = path.join(skillsDir, skillName, versionName, "SKILL.md");

      if (!fs.existsSync(skillFile)) {
        errors.push(`${skillLabel}: missing SKILL.md`);
        continue;
      }

      const rawContent = fs.readFileSync(skillFile, "utf8");
      const content = rawContent.trim();

      if (!content) {
        errors.push(`${skillLabel}: SKILL.md is empty`);
        continue;
      }

      validateSkillFrontmatter(skillLabel, skillName, rawContent, errors);
    }

    skills.push({
      skillName,
      versions: versionNames
    });
  }

  if (errors.length > 0) {
    console.error("Skill validation failed:");
    for (const error of errors) console.error(`- ${error}`);
    process.exit(1);
  }

  const summary = skills
    .map((skill) => `${skill.skillName} (${skill.versions.join(", ")})`)
    .join("; ");

  const filterMessage = requestedSkillNames.length > 0 ? " selected" : "";
  console.log(`Validated ${skills.length}${filterMessage} skill(s): ${summary}`);
  return skills;
}

export function resolveSkillVersions(skills, requestedVersion) {
  return skills.map((skill) => {
    const versionName =
      requestedVersion === DEFAULT_VERSION
        ? skill.versions[skill.versions.length - 1]
        : requestedVersion;

    if (!skill.versions.includes(versionName)) {
      fail(
        `${skill.skillName}: version "${versionName}" not found. Available versions: ${skill.versions.join(", ")}`
      );
    }

    return {
      skillName: skill.skillName,
      versionName,
      source: path.join(skillsDir, skill.skillName, versionName)
    };
  });
}
