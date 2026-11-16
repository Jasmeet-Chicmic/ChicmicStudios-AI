#!/usr/bin/env node
// Scaffolds a new skill inside a plugin.
// Usage: npm run new-skill -- <plugin> <skill-name> "Use when ..."
//   e.g. npm run new-skill -- frontend form-validation "Use when building forms with validation"
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { KEBAB } from './lib.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

export function newSkill({ plugin, name, description, root = ROOT }) {
  if (!plugin || !name) throw new Error('usage: new-skill <plugin> <skill-name> "Use when ..."');
  const pluginId = plugin.startsWith('chicmic-') ? plugin : `chicmic-${plugin}`;
  const pluginDir = path.join(root, 'plugins', pluginId);
  if (!fs.existsSync(pluginDir)) throw new Error(`plugin ${pluginId} does not exist`);
  if (!KEBAB.test(name)) throw new Error(`skill name "${name}" must be kebab-case`);

  const dir = path.join(pluginDir, 'skills', name);
  if (fs.existsSync(dir)) throw new Error(`skill ${pluginId}/${name} already exists`);
  fs.mkdirSync(dir, { recursive: true });

  const title = name.replace(/-/g, ' ').replace(/^\w/, (c) => c.toUpperCase());
  const desc = description || `Use when TODO: describe exactly when the agent should use ${name}.`;
  fs.writeFileSync(
    path.join(dir, 'SKILL.md'),
    `---
name: ${name}
description: ${desc}
---

# ${title}

## Steps

1. TODO
2. TODO

## Rules

- TODO

## Finish

Run the project's lint and test commands and report the result.
`,
  );
  return path.join(dir, 'SKILL.md');
}

if (process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1])) {
  try {
    const [plugin, name, description] = process.argv.slice(2);
    const file = newSkill({ plugin, name, description });
    console.log(
      `Created ${path.relative(ROOT, file)}\nRemember to bump the plugin version in plugin.json.`,
    );
  } catch (e) {
    console.error(`✖ ${e.message}`);
    process.exit(1);
  }
}
