import { appendFileSync } from 'node:fs';

// Use semantic-release's result rather than guessing from package.json or Git tags.
// Existing .releaserc plugins, branches, and environment are discovered normally.
export async function runRelease(release, outputFile) {
  if (!outputFile) {
    throw new Error('GITHUB_OUTPUT is required before starting a release');
  }
  appendFileSync(outputFile, 'released=false\n');
  const result = await release();
  if (!result) {
    return false;
  }

  const version = result.nextRelease?.version;
  if (
    typeof version !== 'string' ||
    !/^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)$/.test(version)
  ) {
    throw new Error('semantic-release did not return a stable Docker release version');
  }
  appendFileSync(outputFile, `released=true\nversion=${version}\n`);
  return true;
}
