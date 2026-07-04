#!/usr/bin/env node

import process from "node:process";
import {
  fail,
  parseSkillNameList,
  readOptionValue,
  validateSkillNameOptions,
  validateSkills
} from "./lib/skills.mjs";

function parseArgs(argv) {
  const args = {
    skillNames: [],
    help: false
  };

  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];

    if (arg === "--skill" || arg === "--skills") {
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
Agent Skills validator

Usage:
  npm run validate -- --skill fix-pr

Options:
  --skill <name>[,<name>]   Skill folder name to validate. Can be repeated. Default: all
  --help                     Show help

Examples:
  npm run validate
  npm run validate -- --skill fix-pr
  npm run validate -- --skills fix-pr,commits
`);
}

function main() {
  const args = parseArgs(process.argv.slice(2));

  if (args.help) {
    printHelp();
    return;
  }

  validateSkillNameOptions(args.skillNames);
  validateSkills(args.skillNames);
}

main();
