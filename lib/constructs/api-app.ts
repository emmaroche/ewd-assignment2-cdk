import { Duration, RemovalPolicy } from "aws-cdk-lib";
import { Architecture, Runtime } from "aws-cdk-lib/aws-lambda";
import { NodejsFunction } from "aws-cdk-lib/aws-lambda-nodejs";
import { Construct } from "constructs";
// import { LambdaIntegration, RestApi, Cors } from "aws-cdk-lib/aws-apigateway";
import * as apig from "aws-cdk-lib/aws-apigateway";
import * as cdk from "aws-cdk-lib";
import * as lambdanode from "aws-cdk-lib/aws-lambda-nodejs";
import * as lambda from "aws-cdk-lib/aws-lambda";
import { Table } from "aws-cdk-lib/aws-dynamodb";

type AppApiProps = {
  userPoolId: string;
  userPoolClientId: string;
  tableName: Table;
};

export class APIApp extends Construct {
  public readonly apiUrl: string;

  constructor(scope: Construct, id: string, props: AppApiProps) {
    super(scope, id);

    const appApi = new apig.RestApi(this, "AppApi", {
      description: "Assignment 1 RestApi App",
      endpointTypes: [apig.EndpointType.REGIONAL],
      defaultCorsPreflightOptions: {
        allowOrigins: apig.Cors.ALL_ORIGINS,
      },
    });

    this.apiUrl = appApi.url;

    const getMovieReviewsFn = new lambdanode.NodejsFunction(this, "GetMovieReviewsFn", {
      architecture: lambda.Architecture.ARM_64,
      runtime: lambda.Runtime.NODEJS_16_X,
      entry: `${__dirname}/../../lambdas/getMovieReviews.ts`,
      timeout: cdk.Duration.seconds(10),
      memorySize: 128,
      environment: {
        TABLE_NAME: props.tableName.tableName,
        REGION: "eu-west-1",
      },
    });

    const getAllMovieReviewsFn = new lambdanode.NodejsFunction(this, "GetAllMovieReviewsFn", {
      architecture: lambda.Architecture.ARM_64,
      runtime: lambda.Runtime.NODEJS_16_X,
      entry: `${__dirname}/../../lambdas/getAllMovieReviews.ts`,
      timeout: cdk.Duration.seconds(10),
      memorySize: 128,
      environment: {
        TABLE_NAME: props.tableName.tableName,
        REGION: "eu-west-1",
      },
    });


    // Permissions 
    props.tableName.grantReadData(getMovieReviewsFn);
    props.tableName.grantReadData(getAllMovieReviewsFn);


    // Existing code
    const moviesEndpoint2 = appApi.root.addResource("reviews");
    const movieReviewsByReviewerNameEndpoint = moviesEndpoint2.addResource("{reviewerName}");

    // Add this line
    const movieReviewsByReviewerNameAndMovieIdEndpoint = movieReviewsByReviewerNameEndpoint.addResource("{movieId}");

    // Add a GET method to the new endpoint
    movieReviewsByReviewerNameAndMovieIdEndpoint.addMethod(
      "GET",
      new apig.LambdaIntegration(getMovieReviewsFn, { proxy: true })
    );

    // Existing code
    const reviewsEndpoint = appApi.root.addResource("reviews2");

    // Add a GET method to the reviews endpoint
    reviewsEndpoint.addMethod(
      "GET",
      new apig.LambdaIntegration(getAllMovieReviewsFn, { proxy: true })
    );

  }
}
