import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { initProject, marketplaceSource, TYPES } from '../scripts/init-project.mjs';
import { tmpDir, write } from './helpers.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const REPO = 'acme/chicmic-ai';
const read = (dir, f) => fs.readFileSync(path.join(dir, f), 'utf8');
const settings = (dir) => JSON.parse(read(dir, '.claude/settings.json'));

describe('initProject', () => {
  it('creates AGENTS.md, CLAUDE.md and .claude/settings.json for a react project', () => {
    const target = tmpDir();
    write(target, 'package.json', { name: 'shop-web' });
    const r = initProject({ target, type: 'react', repo: REPO });

    assert.deepEqual(r.created, ['AGENTS.md', 'CLAUDE.md', '.claude/settings.json']);
    assert.match(read(target, 'AGENTS.md'), /^# shop-web/);
    assert.doesNotMatch(read(target, 'AGENTS.md'), /\{\{PROJECT_NAME\}\}/);
    assert.equal(read(target, 'CLAUDE.md'), '@AGENTS.md\n');
    assert.deepEqual(settings(target), {
      extraKnownMarketplaces: { 'chicmic-ai': { source: { source: 'github', repo: REPO } } },
      enabledPlugins: {
        'chicmic-core@chicmic-ai': true,
        'chicmic-frontend@chicmic-ai': true,
      },
    });
  });

  it('uses the Next.js template for nextjs projects and respects --name', () => {
    const target = tmpDir();
    initProject({ target, type: 'nextjs', name: 'Admin Panel', repo: REPO });
    assert.match(read(target, 'AGENTS.md'), /^# Admin Panel/);
    assert.match(read(target, 'AGENTS.md'), /App Router/);
    assert.deepEqual(Object.keys(settings(target).enabledPlugins), [
      'chicmic-core@chicmic-ai',
      'chicmic-frontend@chicmic-ai',
    ]);
  });

  it('falls back to the folder name when there is no package.json', () => {
    const target = tmpDir('my-app-');
    initProject({ target, type: 'react', repo: REPO });
    assert.match(read(target, 'AGENTS.md'), new RegExp(`^# ${path.basename(target)}`));
  });

  it('every type maps to a template that exists', () => {
    for (const [type, cfg] of Object.entries(TYPES)) {
      assert.ok(
        fs.existsSync(path.join(ROOT, 'templates', cfg.template)),
        `${type} → ${cfg.template}`,
      );
    }
  });

  it('does not overwrite an existing AGENTS.md without --force', () => {
    const target = tmpDir();
    write(target, 'AGENTS.md', '# Custom\n');
    const r = initProject({ target, type: 'react', repo: REPO });
    assert.equal(read(target, 'AGENTS.md'), '# Custom\n');
    assert.ok(r.skipped.some((s) => s.startsWith('AGENTS.md')));
  });

  it('overwrites AGENTS.md with force', () => {
    const target = tmpDir();
    write(target, 'AGENTS.md', '# Custom\n');
    initProject({ target, type: 'react', repo: REPO, name: 'New', force: true });
    assert.match(read(target, 'AGENTS.md'), /^# New/);
  });

  it('appends @AGENTS.md to an existing CLAUDE.md and keeps its content', () => {
    const target = tmpDir();
    write(target, 'CLAUDE.md', '# Existing notes\n');
    initProject({ target, type: 'react', repo: REPO });
    const claude = read(target, 'CLAUDE.md');
    assert.match(claude, /# Existing notes/);
    assert.match(claude, /@AGENTS.md/);
  });

  it('is idempotent: running twice does not duplicate @AGENTS.md', () => {
    const target = tmpDir();
    initProject({ target, type: 'react', repo: REPO });
    initProject({ target, type: 'react', repo: REPO });
    assert.equal(read(target, 'CLAUDE.md').match(/@AGENTS.md/g).length, 1);
  });

  it('merges with existing .claude/settings.json instead of replacing it', () => {
    const target = tmpDir();
    write(target, '.claude/settings.json', {
      permissions: { allow: ['Bash(npm test)'] },
      enabledPlugins: { 'other@elsewhere': true },
    });
    initProject({ target, type: 'react', repo: REPO });
    const s = settings(target);
    assert.deepEqual(s.permissions, { allow: ['Bash(npm test)'] });
    assert.equal(s.enabledPlugins['other@elsewhere'], true);
    assert.equal(s.enabledPlugins['chicmic-frontend@chicmic-ai'], true);
  });

  it('accepts a custom plugin list', () => {
    const target = tmpDir();
    initProject({ target, type: 'react', repo: REPO, plugins: 'core' });
    assert.deepEqual(Object.keys(settings(target).enabledPlugins), ['chicmic-core@chicmic-ai']);
  });

  it('rejects unknown plugins, types and missing targets', () => {
    assert.throws(
      () => initProject({ target: tmpDir(), type: 'react', repo: REPO, plugins: 'nope' }),
      /not in marketplace/,
    );
    assert.throws(
      () => initProject({ target: tmpDir(), type: 'cocos', repo: REPO }),
      /--type must be one of/,
    );
    assert.throws(() => initProject({ type: 'react', repo: REPO }), /--target is required/);
    assert.throws(
      () => initProject({ target: '/no/such/dir', type: 'react', repo: REPO }),
      /does not exist/,
    );
  });

  it('refuses to run while the marketplace repo is still a placeholder', () => {
    const fakeRoot = tmpDir();
    fs.cpSync(path.join(ROOT, '.claude-plugin'), path.join(fakeRoot, '.claude-plugin'), {
      recursive: true,
    });
    fs.cpSync(path.join(ROOT, 'templates'), path.join(fakeRoot, 'templates'), { recursive: true });
    write(fakeRoot, 'package.json', { config: { marketplaceRepo: 'YOUR-ORG/chicmic-ai' } });
    assert.throws(
      () => initProject({ target: tmpDir(), type: 'react', root: fakeRoot }),
      /Set the marketplace repo/,
    );
  });
});

describe('marketplaceSource', () => {
  it('uses github for org/repo', () => {
    assert.deepEqual(marketplaceSource('acme/tools'), { source: 'github', repo: 'acme/tools' });
  });
  it('uses git for https and ssh URLs (GitLab, Bitbucket)', () => {
    const url = 'https://gitlab.com/acme/tools.git';
    assert.deepEqual(marketplaceSource(url), { source: 'git', url });
    assert.equal(marketplaceSource('git@gitlab.com:acme/tools.git').source, 'git');
  });
  it('rejects anything else', () => {
    assert.throws(() => marketplaceSource('just-a-name'), /must be/);
  });
});

describe('CLI', () => {
  it('runs end to end and exits non-zero on bad input', () => {
    const target = tmpDir();
    const out = execFileSync(
      'node',
      ['scripts/init-project.mjs', '--target', target, '--type', 'nextjs', '--repo', REPO],
      {
        cwd: ROOT,
        encoding: 'utf8',
      },
    );
    assert.match(out, /\+ AGENTS.md/);
    assert.match(read(target, 'AGENTS.md'), /Next.js/);
    assert.throws(() =>
      execFileSync('node', ['scripts/init-project.mjs', '--type', 'react'], {
        cwd: ROOT,
        stdio: 'pipe',
      }),
    );
  });
});
