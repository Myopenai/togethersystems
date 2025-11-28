import { defineConfig } from 'checkly';

export default defineConfig({
  projectName: 'BusinessConnectHub Playwright',
  logicalId: 'businessconnecthub-playwright',
  repoUrl: 'https://github.com/DEIN-USER/DEIN-REPO',
  checks: {
    activated: true,
    muted: false,
    runtimeId: 'node-20',
    frequency: 10,
    locations: ['eu-west-1'],
    tags: ['businessconnecthub', 'playwright'],
  },
});