import { Stack, StackProps, RemovalPolicy } from "aws-cdk-lib";
import { Construct } from "constructs";
import { APIApp } from "../constructs/api-app";
import { FrontendApp } from "../constructs/frontend";
import { UserPool } from "aws-cdk-lib/aws-cognito";
import { AuthApi } from '../constructs/auth-api'

type InfraStackProps = StackProps;

export class InfraStack extends Stack {
  constructor(scope: Construct, id: string, props: InfraStackProps) {
    super(scope, id, props);

    const userPool = new UserPool(this, "UserPool", {
      signInAliases: { username: true, email: true },
      selfSignUpEnabled: true,
      removalPolicy: RemovalPolicy.DESTROY,
    });

    const userPoolId = userPool.userPoolId;

    const appClient = userPool.addClient("AppClient", {
      authFlows: { userPassword: true },
    });

    const userPoolClientId = appClient.userPoolClientId;

    const authAPI = new AuthApi(this, 'AuthServiceApi', {
      userPoolId: userPoolId,
      userPoolClientId: userPoolClientId,
    });

    const apiApp = new APIApp(this, "APIApp");

    new FrontendApp(this, "FrontendApp", {
      apiUrl: apiApp.apiUrl,
      authUrl: authAPI.apiUrl,
    });
  }
}
