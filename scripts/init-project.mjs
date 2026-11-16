#!/usr/bin/env node
// Adds AGENTS.md, CLAUDE.md and .claude/settings.json to a project so the team
// marketplace and the right plugins are enabled automatically.
//
// Usage:
//   node scripts/init-project.mjs --target ../my-project --type react
//   node scripts/init-project.mjs --target ../admin-panel --type nextjs --name "Admin Panel"
//
// Options:
//   --target   project folder (required)
//   --type     react | nextjs (required)
//   --name     project name for the AGENTS.md title (default: package.json name or folder name)
//   --plugins  comma list, e.g. core,frontend (default depends on --type)
//   --repo     marketplace location: "org/repo" (GitHub) or a git URL (GitLab/Bitbucket)
//              default: package.json → config.marketplaceRepo
//   --force    overwrite an existing AGENTS.md
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { readJson, writeJson } from './lib.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

export const TYPES = {
  react: { template: 'AGENTS.react.md', plugins: ['core', 'frontend'] },
  nextjs: { template: 'AGENTS.nextjs.md', plugins: ['core', 'frontend'] },
};

export function marketplaceSource(repo) {
  if (/^[\w.-]+\/[\w.-]+$/.test(repo)) return { source: 'github', repo };
  if (/^(https?:\/\/|git@)/.test(repo)) return { source: 'git', url: repo };
  throw new Error(`--repo "${repo}" must be "org/repo" or a git URL`);
}

function parseArgs(argv) {
  const out = {};
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (!a.startsWith('--')) continue;
    const key = a.slice(2);
    if (key === 'force') out.force = true;
    else out[key] = argv[++i];
  }
  return out;
}

export function initProject({ target, type, name, plugins, repo, force = false, root = ROOT }) {
  if (!target) throw new Error('--target is required');
  const cfg = TYPES[type];
  if (!cfg) throw new Error(`--type must be one of: ${Object.keys(TYPES).join(', ')}`);

  const mp = readJson(path.join(root, '.claude-plugin', 'marketplace.json'));
  const pkg = readJson(path.join(root, 'package.json'));
  const repoId = repo ?? pkg.config?.marketplaceRepo;
  if (!repoId || repoId.includes('YOUR-ORG')) {
    throw new Error(
      'Set the marketplace repo: pass --repo org/repo or set config.marketplaceRepo in package.json',
    );
  }

  const targetDir = path.resolve(target);
  if (!fs.existsSync(targetDir)) throw new Error(`target folder ${targetDir} does not exist`);

  const shortNames = plugins ? plugins.split(',').map((s) => s.trim()) : cfg.plugins;
  const available = new Set(mp.plugins.map((p) => p.name));
  const pluginIds = shortNames.map((s) => (s.startsWith('chicmic-') ? s : `chicmic-${s}`));
  for (const p of pluginIds) {
    if (!available.has(p)) throw new Error(`plugin "${p}" is not in marketplace.json`);
  }

  const created = [];
  const skipped = [];

  // AGENTS.md
  const agentsPath = path.join(targetDir, 'AGENTS.md');
  if (fs.existsSync(agentsPath) && !force) {
    skipped.push('AGENTS.md (exists — use --force to overwrite)');
  } else {
    let projectName = name;
    const targetPkg = path.join(targetDir, 'package.json');
    if (!projectName && fs.existsSync(targetPkg)) projectName = readJson(targetPkg).name;
    projectName ||= path.basename(targetDir);
    const tpl = fs.readFileSync(path.join(root, 'templates', cfg.template), 'utf8');
    fs.writeFileSync(agentsPath, tpl.replaceAll('{{PROJECT_NAME}}', projectName));
    created.push('AGENTS.md');
  }

  // CLAUDE.md — Claude Code reads CLAUDE.md; import AGENTS.md so there is one source of truth.
  const claudePath = path.join(targetDir, 'CLAUDE.md');
  if (!fs.existsSync(claudePath)) {
    fs.writeFileSync(claudePath, '@AGENTS.md\n');
    created.push('CLAUDE.md');
  } else if (!fs.readFileSync(claudePath, 'utf8').includes('@AGENTS.md')) {
    fs.appendFileSync(claudePath, '\n@AGENTS.md\n');
    created.push('CLAUDE.md (appended @AGENTS.md)');
  } else skipped.push('CLAUDE.md (already imports AGENTS.md)');

  // .claude/settings.json — merge, never clobber other settings.
  const settingsPath = path.join(targetDir, '.claude', 'settings.json');
  const settings = fs.existsSync(settingsPath) ? readJson(settingsPath) : {};
  settings.extraKnownMarketplaces = {
    ...settings.extraKnownMarketplaces,
    [mp.name]: { source: marketplaceSource(repoId) },
  };
  settings.enabledPlugins = { ...settings.enabledPlugins };
  for (const p of pluginIds) settings.enabledPlugins[`${p}@${mp.name}`] = true;
  writeJson(settingsPath, settings);
  created.push('.claude/settings.json');

  return { created, skipped, plugins: pluginIds, targetDir };
}

// CLI
if (process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1])) {
  try {
    const r = initProject(parseArgs(process.argv.slice(2)));
    console.log(`Initialized ${r.targetDir}`);
    for (const c of r.created) console.log(`  + ${c}`);
    for (const s of r.skipped) console.log(`  = ${s}`);
    console.log(`  plugins: ${r.plugins.join(', ')}`);
    console.log(
      '\nNext: fill in the TODOs in AGENTS.md (or ask Claude: "use the agents-md-writer skill"), then commit.',
    );
  } catch (e) {
    console.error(`✖ ${e.message}`);
    process.exit(1);
  }
}
