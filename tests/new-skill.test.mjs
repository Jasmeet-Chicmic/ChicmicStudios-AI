import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { newSkill } from '../scripts/new-skill.mjs';
import { validateSkill } from '../scripts/validate.mjs';
import { makeRepo } from './helpers.mjs';

describe('newSkill', () => {
  it('creates a SKILL.md that passes validation', () => {
    const root = makeRepo({ plugins: { 'chicmic-frontend': ['existing'] } });
    const file = newSkill({
      plugin: 'frontend',
      name: 'form-validation',
      description: 'Use when building forms with validation.',
      root,
    });
    assert.ok(fs.existsSync(file));
    const r = validateSkill(path.dirname(file));
    assert.deepEqual(r.errors, []);
    assert.equal(r.name, 'form-validation');
  });

  it('rejects bad names, unknown plugins and duplicates', () => {
    const root = makeRepo({ plugins: { 'chicmic-core': ['existing'] } });
    assert.throws(() => newSkill({ plugin: 'core', name: 'Bad Name', root }), /kebab-case/);
    assert.throws(() => newSkill({ plugin: 'nope', name: 'x', root }), /does not exist/);
    assert.throws(() => newSkill({ plugin: 'core', name: 'existing', root }), /already exists/);
  });
});
