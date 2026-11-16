import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { validateRepo, validateSkill, validateTemplate } from '../scripts/validate.mjs';
import { makeRepo, write, skillMd, tmpDir, VALID_TEMPLATE } from './helpers.mjs';

const REPO_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

describe('this repository', () => {
  it('passes validation with no errors', () => {
    const { errors, stats } = validateRepo(REPO_ROOT);
    assert.deepEqual(errors, []);
    assert.equal(stats.plugins, 2);
    assert.ok(stats.skills >= 17, 'expected at least 17 skills');
  });

  it('ships the core React and Next.js skills', () => {
    const skillsDir = path.join(REPO_ROOT, 'plugins/chicmic-frontend/skills');
    const skills = fs.readdirSync(skillsDir);
    for (const s of [
      'react-component',
      'react-performance',
      'nextjs-app-router',
      'state-management',
      'api-integration',
      'forms-validation',
      'error-handling',
      'styling-design-system',
      'accessibility',
      'frontend-security',
      'react-testing',
      'e2e-testing',
      'frontend-tooling-setup',
    ]) {
      assert.ok(skills.includes(s), `missing skill ${s}`);
    }
  });

  it('has no validation warnings', () => {
    assert.deepEqual(validateRepo(REPO_ROOT).warnings, []);
  });
});

describe('validateRepo', () => {
  it('accepts a minimal valid marketplace', () => {
    const r = validateRepo(makeRepo());
    assert.deepEqual(r.errors, []);
    assert.deepEqual(r.stats, { plugins: 1, skills: 1, templates: 1 });
  });

  it('fails when marketplace.json is missing', () => {
    assert.match(validateRepo(tmpDir()).errors[0], /missing .claude-plugin\/marketplace.json/);
  });

  it('fails on invalid JSON', () => {
    const root = makeRepo();
    write(root, '.claude-plugin/marketplace.json', '{ not json');
    assert.match(validateRepo(root).errors[0], /not valid JSON/);
  });

  it('fails when a plugin source does not exist', () => {
    const root = makeRepo();
    const file = path.join(root, '.claude-plugin/marketplace.json');
    const mp = JSON.parse(fs.readFileSync(file, 'utf8'));
    mp.plugins.push({ name: 'ghost', source: './plugins/ghost', description: 'x' });
    fs.writeFileSync(file, JSON.stringify(mp));
    assert.ok(validateRepo(root).errors.some((e) => /ghost.*does not exist/.test(e)));
  });

  it('fails when plugin.json name differs from the marketplace entry', () => {
    const root = makeRepo();
    write(root, 'plugins/demo-plugin/.claude-plugin/plugin.json', {
      name: 'other',
      version: '1.0.0',
    });
    assert.ok(validateRepo(root).errors.some((e) => /≠ marketplace entry/.test(e)));
  });

  it('fails on a non-semver plugin version', () => {
    const root = makeRepo();
    write(root, 'plugins/demo-plugin/.claude-plugin/plugin.json', {
      name: 'demo-plugin',
      version: 'v1',
      description: 'x',
    });
    assert.ok(validateRepo(root).errors.some((e) => /not semver/.test(e)));
  });

  it('fails when two plugins define the same skill name', () => {
    const root = makeRepo({ plugins: { 'plugin-a': ['shared'], 'plugin-b': ['shared'] } });
    assert.ok(validateRepo(root).errors.some((e) => /skill "shared" exists in both/.test(e)));
  });

  it('fails on duplicate plugin names', () => {
    const root = makeRepo();
    const file = path.join(root, '.claude-plugin/marketplace.json');
    const mp = JSON.parse(fs.readFileSync(file, 'utf8'));
    mp.plugins.push({ ...mp.plugins[0] });
    fs.writeFileSync(file, JSON.stringify(mp));
    assert.ok(validateRepo(root).errors.some((e) => /duplicate plugin/.test(e)));
  });

  it('warns about plugin folders not listed in the marketplace', () => {
    const root = makeRepo();
    write(root, 'plugins/orphan/.claude-plugin/plugin.json', { name: 'orphan', version: '1.0.0' });
    assert.ok(validateRepo(root).warnings.some((w) => /plugins\/orphan is not listed/.test(w)));
  });
});

describe('validateSkill', () => {
  const skillDir = (name, content) => {
    const root = tmpDir();
    write(root, `skills/${name}/SKILL.md`, content);
    return path.join(root, 'skills', name);
  };

  it('accepts a valid skill', () => {
    const r = validateSkill(skillDir('good-skill', skillMd('good-skill')));
    assert.deepEqual(r.errors, []);
    assert.deepEqual(r.warnings, []);
    assert.equal(r.name, 'good-skill');
  });

  it('fails without frontmatter', () => {
    const r = validateSkill(skillDir('no-fm', '# Just a heading\n'));
    assert.match(r.errors[0], /missing YAML frontmatter/);
  });

  it('fails when SKILL.md is missing', () => {
    const root = tmpDir();
    fs.mkdirSync(path.join(root, 'skills', 'empty'), { recursive: true });
    assert.match(validateSkill(path.join(root, 'skills', 'empty')).errors[0], /missing SKILL.md/);
  });

  it('fails when name does not match the folder', () => {
    const r = validateSkill(skillDir('folder-name', skillMd('other-name')));
    assert.ok(r.errors.some((e) => /must match folder name/.test(e)));
  });

  it('fails on a non-kebab-case name', () => {
    const r = validateSkill(skillDir('Bad_Name', skillMd('Bad_Name')));
    assert.ok(r.errors.some((e) => /kebab-case/.test(e)));
  });

  it('fails without a description', () => {
    const r = validateSkill(skillDir('no-desc', '---\nname: no-desc\n---\n\nBody\n'));
    assert.ok(r.errors.some((e) => /"description" is required/.test(e)));
  });

  it('fails when the description is too long', () => {
    const r = validateSkill(
      skillDir('long-desc', skillMd('long-desc', `Use when ${'x'.repeat(1100)}`)),
    );
    assert.ok(r.errors.some((e) => /longer than 1024/.test(e)));
  });

  it('fails when the description contains angle brackets', () => {
    const r = validateSkill(skillDir('angle', skillMd('angle', 'Use when <tag> appears')));
    assert.ok(r.errors.some((e) => /must not contain/.test(e)));
  });

  it('warns when the description does not say when to use it', () => {
    const r = validateSkill(skillDir('vague', skillMd('vague', 'Helps with stuff.')));
    assert.deepEqual(r.errors, []);
    assert.ok(r.warnings.some((w) => /Use when/.test(w)));
  });

  it('fails on an empty body', () => {
    const r = validateSkill(skillDir('empty-body', skillMd('empty-body', 'Use when x.', '')));
    assert.ok(r.errors.some((e) => /body is empty/.test(e)));
  });

  it('fails when a referenced bundled file is missing', () => {
    const body = 'See `references/missing.md` for details.\n';
    const r = validateSkill(skillDir('refs', skillMd('refs', 'Use when x.', body)));
    assert.ok(r.errors.some((e) => /missing file "references\/missing.md"/.test(e)));
  });

  it('passes when a referenced bundled file exists', () => {
    const dir = skillDir('refs-ok', skillMd('refs-ok', 'Use when x.', 'See `references/a.md`.\n'));
    write(dir, 'references/a.md', '# A\n');
    assert.deepEqual(validateSkill(dir).errors, []);
  });
});

describe('validateTemplate', () => {
  it('accepts a template with all sections', () => {
    const root = tmpDir();
    assert.deepEqual(validateTemplate(write(root, 'AGENTS.x.md', VALID_TEMPLATE)).errors, []);
  });

  it('fails when a required section is missing', () => {
    const root = tmpDir();
    const file = write(root, 'AGENTS.x.md', VALID_TEMPLATE.replace('## Do not\n', ''));
    assert.ok(validateTemplate(file).errors.some((e) => /missing section "## Do not"/.test(e)));
  });

  it('fails without the project name placeholder', () => {
    const root = tmpDir();
    const file = write(root, 'AGENTS.x.md', VALID_TEMPLATE.replace('{{PROJECT_NAME}}', 'Fixed'));
    assert.ok(validateTemplate(file).errors.some((e) => /PROJECT_NAME/.test(e)));
  });

  it('accepts ts/js language markers and rejects unknown ones', () => {
    const root = tmpDir();
    const ok = write(root, 'AGENTS.ok.md', VALID_TEMPLATE + '- a <!-- ts -->\n- b <!-- js -->\n');
    assert.deepEqual(validateTemplate(ok).errors, []);
    const bad = write(root, 'AGENTS.bad.md', VALID_TEMPLATE + '- a <!-- tsx -->\n');
    assert.ok(validateTemplate(bad).errors.some((e) => /unknown language marker/.test(e)));
  });

  it('fails when the template is too long', () => {
    const root = tmpDir();
    const file = write(root, 'AGENTS.x.md', VALID_TEMPLATE + 'line\n'.repeat(200));
    assert.ok(validateTemplate(file).errors.some((e) => /max 150/.test(e)));
  });
});
