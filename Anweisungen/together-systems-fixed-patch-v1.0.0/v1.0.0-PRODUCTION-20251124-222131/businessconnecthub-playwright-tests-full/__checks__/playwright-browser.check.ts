import { BrowserCheck } from 'checkly/constructs';

new BrowserCheck('businessconnecthub-home', {
  name: 'BusinessConnectHub – Home Smoke',
  activated: true,
  frequency: 10,
  locations: ['eu-west-1'],
  code: {
    entrypoint: './checks/home.check.ts',
  },
});