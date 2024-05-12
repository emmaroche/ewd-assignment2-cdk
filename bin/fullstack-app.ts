import * as cdk from "aws-cdk-lib";
import { InfraStack } from "../lib/stacks/fullstack-app-stack";
import { Account, Region } from '../env';

const app = new cdk.App();

new InfraStack(app, "FullStack", {
  env: {
    region: Region,
    account: Account,
  },
  crossRegionReferences: true,
});