import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { copyFileSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import test from 'node:test';
import { runRelease } from './release-output.mjs';

function fixture(t) {
  const directory = mkdtempSync(join(tmpdir(), 'coverage-release-test-'));
  t.after(() => rmSync(directory, { recursive: true, force: true }));
  return { directory, output: join(directory, 'github-output') };
}

function outputs(path) {
  return Object.fromEntries(
    readFileSync(path, 'utf8').trim().split('\n').map(line => line.split('=')),
  );
}

test('new release publishes the exact version reported by semantic-release', async t => {
  const { output } = fixture(t);
  let calls = 0;
  const released = await runRelease(async () => {
    calls++;
    assert.deepEqual(outputs(output), { released: 'false' });
    return { lastRelease: { version: '1.2.2' }, nextRelease: { version: '1.2.3' } };
  }, output);
  assert.equal(calls, 1);
  assert.equal(released, true);
  assert.deepEqual(outputs(output), { released: 'true', version: '1.2.3' });
});

for (const result of [false, undefined]) {
  test(`no-release result ${result} skips Docker publishing without a version`, async t => {
    const { output } = fixture(t);
    assert.equal(await runRelease(async () => result, output), false);
    assert.deepEqual(outputs(output), { released: 'false' });
  });
}

test('release errors propagate and never enable Docker publishing', async t => {
  const { output } = fixture(t);
  await assert.rejects(
    runRelease(async () => { throw new Error('release failed'); }, output),
    /release failed/,
  );
  assert.deepEqual(outputs(output), { released: 'false' });
});

test('missing output path fails before invoking semantic-release', async () => {
  let invoked = false;
  await assert.rejects(runRelease(async () => { invoked = true; }), /GITHUB_OUTPUT/);
  assert.equal(invoked, false);
});

test('invalid or unsupported versions never enable Docker publishing', async t => {
  const { output } = fixture(t);
  for (const version of [undefined, 'undefined', 'v1.2.3', '01.2.3', '1.2.3-beta.1', '1.2.3\nreleased=true']) {
    writeFileSync(output, '');
    await assert.rejects(runRelease(async () => ({ nextRelease: { version } }), output), /stable Docker release version/);
    assert.deepEqual(outputs(output), { released: 'false' });
  }
});

for (const scenario of ['release', 'skip', 'error']) {
  test(`workflow CLI entry point handles ${scenario}`, t => {
    const { directory, output } = fixture(t);
    const script = join(directory, 'release.mjs');
    copyFileSync(new URL('./release.mjs', import.meta.url), script);
    copyFileSync(new URL('./release-output.mjs', import.meta.url), join(directory, 'release-output.mjs'));
    const packageDirectory = join(directory, 'node_modules', 'semantic-release');
    mkdirSync(packageDirectory, { recursive: true });
    writeFileSync(join(packageDirectory, 'package.json'), JSON.stringify({
      name: 'semantic-release', type: 'module', exports: './index.js',
    }));
    // No GitHub, registry, Git tags, or real release side effects.
    writeFileSync(join(packageDirectory, 'index.js'), `
      export default async function (...args) {
        if (args.length) throw new Error('release options were overridden');
        if (process.env.RELEASE_SCENARIO === 'error') throw new Error('release failed');
        return process.env.RELEASE_SCENARIO === 'skip'
          ? false : { nextRelease: { version: '2.3.4' } };
      }
    `);
    const result = spawnSync(process.execPath, [script], {
      env: { ...process.env, GITHUB_OUTPUT: output, RELEASE_SCENARIO: scenario },
      encoding: 'utf8',
    });
    assert.equal(result.error, undefined);
    assert.equal(result.status, scenario === 'error' ? 1 : 0, result.stderr);
    assert.deepEqual(outputs(output), scenario === 'release'
      ? { released: 'true', version: '2.3.4' } : { released: 'false' });
  });
}
