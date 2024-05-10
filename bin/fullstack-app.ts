import * as cdk from "aws-cdk-lib";
import { InfraStack } from "../lib/stacks/fullstack-app-stack";
// import { CertStack } from '../lib/stacks/acm-cert-stack';
import { Account, Region } from '../env';

const app = new cdk.App();

// const certStack = new CertStack(app, "Stack1", {
//   env: {
//     region: "us-east-1",
//     account: Account,
//   },
//   crossRegionReferences: true,
// });

new InfraStack(app, "FullStack", {
  env: {
    region: Region,
    account: Account,
  },
  crossRegionReferences: true,
});