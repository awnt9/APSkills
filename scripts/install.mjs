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
    validateOnly: false,
    help: false
  };

  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];

    if (arg === "--agent") args.agent = argv[++i];
    else if (arg === "--scope") args.scope = argv[++i];
    else if (arg === "--validate-only") args.validateOnly = true;
    else if (arg === "--help" || arg === "-h") args.help = true;
    else fail(`Unknown argument: ${arg}`);
  }

  return args;
}

function printHelp() {
  console.log(`
Agent Skills installer

Usage:
  npm run install -- --agent all --scope user

Options:
  --agent codex|claude|all      Agent target. Default: all
  --scope user|repo             Install globally or inside this repo. Default: user
  --validate-only               Only validate skills structure
  --help                        Show help

Examples:
  npm run install -- --agent all --scope user
  npm run install -- --agent codex --scope user
  npm run install -- --agent claude --scope repo
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

function validateSkills() {
  const skillNames = getSkillNames();

  if (skillNames.length === 0) {
    console.log("No skills found in ./skills yet.");
    return skillNames;
  }

  const errors = [];

  for (const skillName of skillNames) {
    const skillPath = path.join(skillsDir, skillName);
    const skillFile = path.join(skillPath, "SKILL.md");

    if (!fs.existsSync(skillFile)) {
      errors.push(`${skillName}: missing SKILL.md`);
      continue;
    }

    const content = fs.readFileSync(skillFile, "utf8").trim();

    if (!content) {
      errors.push(`${skillName}: SKILL.md is empty`);
    }
  }

  if (errors.length > 0) {
    console.error("Skill validation failed:");
    for (const error of errors) console.error(`- ${error}`);
    process.exit(1);
  }

  console.log(`Validated ${skillNames.length} skill(s): ${skillNames.join(", ")}`);
  return skillNames;
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

function installSkill({ skillName, targetDir }) {
  const source = path.join(skillsDir, skillName);
  const destination = path.join(targetDir, skillName);

  fs.mkdirSync(targetDir, { recursive: true });
  copyDirectory(source, destination);

  console.log(`Installed ${skillName} -> ${destination}`);
}

function main() {
  const args = parseArgs(process.argv.slice(2));

  if (args.help) {
    printHelp();
    return;
  }

  validateOptions(args);

  const skillNames = validateSkills();

  if (args.validateOnly) {
    return;
  }

  if (skillNames.length === 0) {
    console.log("Nothing to install. Add skills under ./skills/<skill-name>/SKILL.md first.");
    return;
  }

  const targets = getTargets(args.agent, args.scope);

  for (const target of targets) {
    console.log(`\nTarget: ${target.agentName}`);
    console.log(`Directory: ${target.targetDir}`);

    for (const skillName of skillNames) {
      installSkill({
        skillName,
        targetDir: target.targetDir
      });
    }
  }

  console.log("\nDone.");
}

main();
