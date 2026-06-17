#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import os from "node:os";
import process from "node:process";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, "..");
const skillsDir = path.join(repoRoot, "skills");
const DEFAULT_VERSION = "latest";
const REQUIRED_README_SECTIONS = [
  "Autor",
  "Resumen",
  "Cuándo usarla",
  "Cuándo no usarla",
  "Requisitos previos",
  "Cómo usar"
];

const AGENTS = {
  codex: {
    userDir: path.join(os.homedir(), ".agents", "skills"),
    repoDir: path.join(repoRoot, ".agents", "skills")
  },
  claude: {
    userDir: path.join(os.homedir(), ".claude", "skills"),
    repoDir: path.join(repoRoot, ".claude", "skills")
  }
};

function parseArgs(argv) {
  const args = {
    agent: "all",
    scope: "user",
    version: DEFAULT_VERSION,
    validateOnly: false,
    help: false
  };

  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];

    if (arg === "--agent") args.agent = readOptionValue(argv, ++i, arg);
    else if (arg === "--scope") args.scope = readOptionValue(argv, ++i, arg);
    else if (arg === "--version") args.version = readOptionValue(argv, ++i, arg);
    else if (arg === "--validate-only") args.validateOnly = true;
    else if (arg === "--help" || arg === "-h") args.help = true;
    else fail(`Unknown argument: ${arg}`);
  }

  return args;
}

function readOptionValue(argv, index, optionName) {
  const value = argv[index];

  if (!value || value.startsWith("--")) {
    fail(`Missing value for ${optionName}`);
  }

  return value;
}

function printHelp() {
  console.log(`
Agent Skills installer

Usage:
  npm run install -- --agent all --scope user --version latest

Options:
  --agent codex|claude|all      Agent target. Default: all
  --scope user|repo             Install globally or inside this repo. Default: user
  --version <version>|latest     Skill version to install. Default: latest
  --validate-only               Only validate skills structure
  --help                        Show help

Examples:
  npm run install -- --agent all --scope user
  npm run install -- --agent codex --scope user
  npm run install -- --agent claude --scope repo
  npm run install -- --agent all --scope user --version v1
`);
}

function fail(message) {
  console.error(`Error: ${message}`);
  process.exit(1);
}

function validateOptions(args) {
  const validAgents = ["codex", "claude", "all"];
  const validScopes = ["user", "repo"];

  if (!validAgents.includes(args.agent)) {
    fail(`Invalid --agent "${args.agent}". Use: ${validAgents.join(", ")}`);
  }

  if (!validScopes.includes(args.scope)) {
    fail(`Invalid --scope "${args.scope}". Use: ${validScopes.join(", ")}`);
  }

  if (!args.version) {
    fail(`Invalid --version "${args.version}". Use a version like v1 or ${DEFAULT_VERSION}`);
  }

  if (args.version !== DEFAULT_VERSION && !isVersionName(args.version)) {
    fail(`Invalid --version "${args.version}". Use a version like v1 or ${DEFAULT_VERSION}`);
  }
}

function getSkillNames() {
  if (!fs.existsSync(skillsDir)) {
    fail(`Missing skills directory: ${skillsDir}`);
  }

  return fs
    .readdirSync(skillsDir, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .sort();
}

function isSkillName(name) {
  return /^[a-z0-9-]+$/.test(name);
}

function isVersionName(name) {
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

function getSkillVersionNames(skillName) {
  const skillPath = path.join(skillsDir, skillName);

  return fs
    .readdirSync(skillPath, { withFileTypes: true })
    .filter((entry) => entry.isDirectory() && isVersionName(entry.name))
    .map((entry) => entry.name)
    .sort(compareVersions);
}

function validateSkillFrontmatter(skillLabel, content, errors) {
  const lines = content.replace(/^\uFEFF/, "").split(/\r?\n/);
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

function validateSkills() {
  const skillNames = getSkillNames();

  if (skillNames.length === 0) {
    console.log("No skills found in ./skills yet.");
    return skillNames;
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

      validateSkillFrontmatter(skillLabel, rawContent, errors);
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

  console.log(`Validated ${skills.length} skill(s): ${summary}`);
  return skills;
}

function resolveSkillVersions(skills, requestedVersion) {
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

function getTargets(agent, scope) {
  const agents = agent === "all" ? Object.keys(AGENTS) : [agent];

  return agents.map((agentName) => {
    const config = AGENTS[agentName];
    const targetDir = scope === "user" ? config.userDir : config.repoDir;

    return {
      agentName,
      targetDir
    };
  });
}

function removePath(targetPath) {
  if (!fs.existsSync(targetPath)) return;

  const stats = fs.lstatSync(targetPath);

  if (stats.isSymbolicLink() || stats.isFile()) {
    fs.unlinkSync(targetPath);
  } else {
    fs.rmSync(targetPath, { recursive: true, force: true });
  }
}

function copyDirectory(source, destination) {
  removePath(destination);

  fs.cpSync(source, destination, {
    recursive: true,
    dereference: true,
    force: true
  });
}

function installSkill({ skillName, versionName, source, targetDir }) {
  const destination = path.join(targetDir, skillName);

  fs.mkdirSync(targetDir, { recursive: true });
  copyDirectory(source, destination);

  console.log(`Installed ${skillName}@${versionName} -> ${destination}`);
}

function main() {
  const args = parseArgs(process.argv.slice(2));

  if (args.help) {
    printHelp();
    return;
  }

  validateOptions(args);

  const skills = validateSkills();
  const selectedSkills = resolveSkillVersions(skills, args.version);

  if (args.validateOnly) {
    return;
  }

  if (skills.length === 0) {
    console.log("Nothing to install. Add skills under ./skills/<skill-name>/<version>/SKILL.md first.");
    return;
  }

  const targets = getTargets(args.agent, args.scope);

  for (const target of targets) {
    console.log(`\nTarget: ${target.agentName}`);
    console.log(`Directory: ${target.targetDir}`);

    for (const skill of selectedSkills) {
      installSkill({
        skillName: skill.skillName,
        versionName: skill.versionName,
        source: skill.source,
        targetDir: target.targetDir
      });
    }
  }

  console.log("\nDone.");
}

main();
