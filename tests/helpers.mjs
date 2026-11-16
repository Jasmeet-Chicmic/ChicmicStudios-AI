import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

export function tmpDir(prefix = 'chicmic-ai-') {
  return fs.mkdtempSync(path.join(os.tmpdir(), prefix));
}

export function write(root, rel, content) {
  const file = path.join(root, rel);
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, typeof content === 'string' ? content : JSON.stringify(content, null, 2));
  return file;
}

export function skillMd(
  name,
  description = `Use when testing ${name}.`,
  body = '# Body\n\nDo things.\n',
) {
  return `---\nname: ${name}\ndescription: ${description}\n---\n\n${body}`;
}

export const VALID_TEMPLATE = `# {{PROJECT_NAME}}

## Overview
x
## Tech stack
x
## Commands
x
## Project structure
x
## Conventions
x
## Do not
x
## Definition of done
x
`;

/** Builds a minimal valid marketplace repo in a temp dir. */
export function makeRepo({
  plugins = { 'demo-plugin': ['demo-skill'] },
  template = VALID_TEMPLATE,
} = {}) {
  const root = tmpDir();
  write(root, '.claude-plugin/marketplace.json', {
    name: 'test-market',
    owner: { name: 'Test' },
    plugins: Object.keys(plugins).map((name) => ({
      name,
      source: `./plugins/${name}`,
      description: `${name} plugin`,
    })),
  });
  for (const [name, skills] of Object.entries(plugins)) {
    write(root, `plugins/${name}/.claude-plugin/plugin.json`, {
      name,
      version: '1.0.0',
      description: 'x',
    });
    for (const s of skills) write(root, `plugins/${name}/skills/${s}/SKILL.md`, skillMd(s));
  }
  if (template) write(root, 'templates/AGENTS.test.md', template);
  write(root, 'package.json', {
    name: 'test-market',
    config: { marketplaceRepo: 'acme/test-market' },
  });
  return root;
}
