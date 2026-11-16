// Shared helpers for chicmicstudios-ai scripts.
import fs from 'node:fs';
import path from 'node:path';
import YAML from 'yaml';

export const KEBAB = /^[a-z0-9]+(-[a-z0-9]+)*$/;
export const SEMVER = /^\d+\.\d+\.\d+(-[0-9A-Za-z.-]+)?$/;

export function readJson(file) {
  return JSON.parse(fs.readFileSync(file, 'utf8'));
}

export function writeJson(file, data) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, JSON.stringify(data, null, 2) + '\n');
}

/**
 * Split a markdown file into YAML frontmatter and body.
 * Returns { data, body } or throws if the frontmatter is missing or invalid.
 */
export function parseFrontmatter(text) {
  const normalized = text.replace(/\r\n/g, '\n');
  const match = normalized.match(/^---\n([\s\S]*?)\n---\n?([\s\S]*)$/);
  if (!match) throw new Error('missing YAML frontmatter (file must start with ---)');
  const data = YAML.parse(match[1]) ?? {};
  if (typeof data !== 'object' || Array.isArray(data)) {
    throw new Error('frontmatter must be a YAML mapping');
  }
  return { data, body: match[2] };
}

export function listDirs(dir) {
  if (!fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir, { withFileTypes: true })
    .filter((d) => d.isDirectory())
    .map((d) => d.name)
    .sort();
}
