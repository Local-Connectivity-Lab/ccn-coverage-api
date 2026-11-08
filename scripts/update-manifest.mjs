import updateManifest from './publish-version.js';

const version = process.env.VERSION;
if (!version || !/^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)$/.test(version)) {
  throw new Error('A stable release VERSION is required to update the deployment manifest');
}

await updateManifest({}, {
  nextRelease: { version },
  logger: console,
  env: process.env,
});
