import semanticRelease from 'semantic-release';
import { runRelease } from './release-output.mjs';

await runRelease(() => semanticRelease(), process.env.GITHUB_OUTPUT);
