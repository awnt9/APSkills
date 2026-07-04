#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import os from "node:os";
import process from "node:process";
import {
  DEFAULT_VERSION,
  fail,
  isVersionName,
  parseSkillNameList,
  readOptionValue,
  repoRoot,
  resolveSkillVersions,
  validateSkillNameOptions,
  validateSkills
} from "./lib/skills.mjs";

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
    skillNames: [],
    help: false
  };

  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];

    if (arg === "--agent") args.agent = readOptionValue(argv, ++i, arg);
    else if (arg === "--scope") args.scope = readOptionValue(argv, ++i, arg);
    else if (arg === "--version") args.version = readOptionValue(argv, ++i, arg);
    else if (arg === "--skill" || arg === "--skills") {
      args.skillNames.push(...parseSkillNameList(readOptionValue(argv, ++i, arg), arg));
    } else if (arg === "--help" || arg === "-h") {
      args.help = true;
    } else {
      fail(`Unknown argument: ${arg}`);
    }
  }

  args.skillNames = [...new Set(args.skillNames)];
  return args;
}

function printHelp() {
  console.log(`
Agent Skills installer

Usage:
  npm run install -- --agent all --scope user --version latest --skill fix-pr

Options:
  --agent codex|claude|all      Agent target. Default: all
  --scope user|repo             Install globally or inside this repo. Default: user
  --version <version>|latest    Skill version to install. Default: latest
  --skill <name>[,<name>]       Skill folder name to install. Can be repeated. Default: all
  --help                        Show help

Examples:
  npm run install -- --agent all --scope user
  npm run install -- --agent codex --scope user
  npm run install -- --agent claude --scope repo
  npm run install -- --agent all --scope user --version v1
  npm run install -- --skill fix-pr
  npm run install -- --skills fix-pr,commits
`);
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

  validateSkillNameOptions(args.skillNames);
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

  const skills = validateSkills(args.skillNames);
  const selectedSkills = resolveSkillVersions(skills, args.version);

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
