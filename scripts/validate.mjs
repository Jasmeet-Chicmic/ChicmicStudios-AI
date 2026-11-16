#!/usr/bin/env node
// Validates the marketplace, every plugin, every skill and every AGENTS.md template.
// Usage: node scripts/validate.mjs [repoRoot]
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { KEBAB, SEMVER, readJson, parseFrontmatter, listDirs } from './lib.mjs';

export const REQUIRED_TEMPLATE_SECTIONS = [
  '## Overview',
  '## Tech stack',
  '## Commands',
  '## Project structure',
  '## Conventions',
  '## Do not',
  '## Definition of done',
];
export const MAX_TEMPLATE_LINES = 150;
export const MAX_SKILL_LINES = 500;
export const MAX_NAME = 64;
export const MAX_DESCRIPTION = 1024;

export function validateSkill(skillDir) {
  const errors = [];
  const warnings = [];
  const dirName = path.basename(skillDir);
  const file = path.join(skillDir, 'SKILL.md');
  const rel = (p) => path.relative(path.dirname(path.dirname(skillDir)), p);

  if (!fs.existsSync(file)) {
    errors.push(`${rel(skillDir)}: missing SKILL.md`);
    return { errors, warnings };
  }

  let parsed;
  try {
    parsed = parseFrontmatter(fs.readFileSync(file, 'utf8'));
  } catch (e) {
    errors.push(`${rel(file)}: ${e.message}`);
    return { errors, warnings };
  }
  const { data, body } = parsed;

  if (!data.name) errors.push(`${rel(file)}: frontmatter "name" is required`);
  else {
    if (!KEBAB.test(data.name)) errors.push(`${rel(file)}: name "${data.name}" must be kebab-case`);
    if (data.name.length > MAX_NAME)
      errors.push(`${rel(file)}: name longer than ${MAX_NAME} chars`);
    if (data.name !== dirName) {
      errors.push(`${rel(file)}: name "${data.name}" must match folder name "${dirName}"`);
    }
  }

  if (!data.description || typeof data.description !== 'string') {
    errors.push(`${rel(file)}: frontmatter "description" is required`);
  } else {
    if (data.description.length > MAX_DESCRIPTION) {
      errors.push(`${rel(file)}: description longer than ${MAX_DESCRIPTION} chars`);
    }
    if (/[<>]/.test(data.description)) {
      errors.push(`${rel(file)}: description must not contain < or >`);
    }
    if (!/\buse when\b/i.test(data.description)) {
      warnings.push(`${rel(file)}: description should say when to use it ("Use when ...")`);
    }
  }

  if (!body.trim()) errors.push(`${rel(file)}: body is empty`);
  const lines = body.split('\n').length;
  if (lines > MAX_SKILL_LINES) {
    warnings.push(
      `${rel(file)}: ${lines} lines — move detail into references/ (max ${MAX_SKILL_LINES})`,
    );
  }

  // Every referenced bundled reference file (`references/...`) must exist.
  // (assets/ and scripts/ are not checked: those names also describe project folders.)
  const refs = body.matchAll(/`(references\/[^`\s]+)`/g);
  for (const [, ref] of refs) {
    if (!fs.existsSync(path.join(skillDir, ref))) {
      errors.push(`${rel(file)}: references missing file "${ref}"`);
    }
  }

  return { errors, warnings, name: data.name };
}

export function validatePlugin(pluginDir, expectedName) {
  const errors = [];
  const warnings = [];
  const skills = [];
  const manifest = path.join(pluginDir, '.claude-plugin', 'plugin.json');
  const label = path.basename(pluginDir);

  if (!fs.existsSync(manifest)) {
    errors.push(`${label}: missing .claude-plugin/plugin.json`);
    return { errors, warnings, skills };
  }
  let json;
  try {
    json = readJson(manifest);
  } catch (e) {
    errors.push(`${label}: plugin.json is not valid JSON (${e.message})`);
    return { errors, warnings, skills };
  }

  if (!json.name) errors.push(`${label}: plugin.json "name" is required`);
  else if (!KEBAB.test(json.name)) errors.push(`${label}: plugin name must be kebab-case`);
  if (expectedName && json.name !== expectedName) {
    errors.push(`${label}: plugin.json name "${json.name}" ≠ marketplace entry "${expectedName}"`);
  }
  if (!json.version)
    warnings.push(`${label}: plugin.json has no "version" — bump it on every change`);
  else if (!SEMVER.test(json.version))
    errors.push(`${label}: version "${json.version}" is not semver`);
  if (!json.description) warnings.push(`${label}: plugin.json has no "description"`);

  const skillsDir = path.join(pluginDir, 'skills');
  const skillDirs = listDirs(skillsDir);
  if (skillDirs.length === 0) warnings.push(`${label}: no skills found in skills/`);
  for (const s of skillDirs) {
    const r = validateSkill(path.join(skillsDir, s));
    errors.push(...r.errors.map((e) => `${label}/skills/${e.replace(/^skills\//, '')}`));
    warnings.push(...r.warnings.map((w) => `${label}/skills/${w.replace(/^skills\//, '')}`));
    if (r.name) skills.push(r.name);
  }
  return { errors, warnings, skills };
}

export function validateTemplate(file) {
  const errors = [];
  const warnings = [];
  const name = path.basename(file);
  const text = fs.readFileSync(file, 'utf8');
  for (const section of REQUIRED_TEMPLATE_SECTIONS) {
    if (!text.split('\n').some((l) => l.trim() === section)) {
      errors.push(`templates/${name}: missing section "${section}"`);
    }
  }
  if (!text.includes('{{PROJECT_NAME}}')) {
    errors.push(`templates/${name}: missing {{PROJECT_NAME}} placeholder in the title`);
  }
  const lines = text.split('\n').length;
  if (lines > MAX_TEMPLATE_LINES) {
    errors.push(`templates/${name}: ${lines} lines, max ${MAX_TEMPLATE_LINES}`);
  }
  return { errors, warnings };
}

export function validateRepo(root) {
  const errors = [];
  const warnings = [];
  const marketplaceFile = path.join(root, '.claude-plugin', 'marketplace.json');

  if (!fs.existsSync(marketplaceFile)) {
    return { errors: ['missing .claude-plugin/marketplace.json'], warnings, stats: {} };
  }
  let mp;
  try {
    mp = readJson(marketplaceFile);
  } catch (e) {
    return { errors: [`marketplace.json is not valid JSON (${e.message})`], warnings, stats: {} };
  }

  if (!mp.name || !KEBAB.test(mp.name)) errors.push('marketplace.json: "name" must be kebab-case');
  if (!mp.owner?.name) errors.push('marketplace.json: "owner.name" is required');
  if (!Array.isArray(mp.plugins) || mp.plugins.length === 0) {
    errors.push('marketplace.json: "plugins" must be a non-empty array');
    return { errors, warnings, stats: {} };
  }

  const seenPlugins = new Set();
  const skillOwners = new Map();
  let skillCount = 0;

  for (const entry of mp.plugins) {
    if (!entry.name) {
      errors.push('marketplace.json: every plugin needs a "name"');
      continue;
    }
    if (seenPlugins.has(entry.name))
      errors.push(`marketplace.json: duplicate plugin "${entry.name}"`);
    seenPlugins.add(entry.name);
    if (!entry.description)
      warnings.push(`marketplace.json: plugin "${entry.name}" has no description`);

    if (typeof entry.source !== 'string') continue; // remote sources (github/git/url) are not checked locally
    if (!entry.source.startsWith('./')) {
      errors.push(`marketplace.json: plugin "${entry.name}" local source must start with "./"`);
      continue;
    }
    const pluginDir = path.resolve(root, entry.source);
    if (!fs.existsSync(pluginDir)) {
      errors.push(`marketplace.json: plugin "${entry.name}" source ${entry.source} does not exist`);
      continue;
    }
    const r = validatePlugin(pluginDir, entry.name);
    errors.push(...r.errors);
    warnings.push(...r.warnings);
    for (const s of r.skills) {
      skillCount++;
      if (skillOwners.has(s)) {
        errors.push(`skill "${s}" exists in both ${skillOwners.get(s)} and ${entry.name}`);
      } else skillOwners.set(s, entry.name);
    }
  }

  // Plugins on disk that are not listed in the marketplace.
  const listed = new Set(
    mp.plugins.filter((p) => typeof p.source === 'string').map((p) => path.resolve(root, p.source)),
  );
  for (const d of listDirs(path.join(root, 'plugins'))) {
    if (!listed.has(path.resolve(root, 'plugins', d))) {
      warnings.push(`plugins/${d} is not listed in marketplace.json`);
    }
  }

  const templatesDir = path.join(root, 'templates');
  let templateCount = 0;
  if (fs.existsSync(templatesDir)) {
    for (const f of fs.readdirSync(templatesDir).filter((f) => /^AGENTS\..+\.md$/.test(f))) {
      templateCount++;
      const r = validateTemplate(path.join(templatesDir, f));
      errors.push(...r.errors);
      warnings.push(...r.warnings);
    }
  }

  return {
    errors,
    warnings,
    stats: { plugins: seenPlugins.size, skills: skillCount, templates: templateCount },
  };
}

// CLI
if (process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1])) {
  const root = path.resolve(
    process.argv[2] ?? path.join(path.dirname(fileURLToPath(import.meta.url)), '..'),
  );
  const { errors, warnings, stats } = validateRepo(root);
  for (const w of warnings) console.warn(`⚠  ${w}`);
  for (const e of errors) console.error(`✖  ${e}`);
  if (errors.length) {
    console.error(`\n${errors.length} error(s), ${warnings.length} warning(s)`);
    process.exit(1);
  }
  console.log(
    `✔ marketplace valid — ${stats.plugins} plugins, ${stats.skills} skills, ${stats.templates} templates` +
      (warnings.length ? `, ${warnings.length} warning(s)` : ''),
  );
}
