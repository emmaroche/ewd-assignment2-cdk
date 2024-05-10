import * as s3 from "aws-cdk-lib/aws-s3";
import * as acm from "aws-cdk-lib/aws-certificatemanager";
import * as cloudfront from "aws-cdk-lib/aws-cloudfront";
import * as targets from "aws-cdk-lib/aws-route53-targets";
import * as cloudfront_origins from "aws-cdk-lib/aws-cloudfront-origins";
import * as s3deploy from "aws-cdk-lib/aws-s3-deployment";
import { CfnOutput, Duration, RemovalPolicy } from "aws-cdk-lib";
import { Construct } from "constructs";

interface FrontendProps {
  apiUrl?: string;
  authUrl?: string;
  certificate?: acm.Certificate;
}

export class FrontendApp extends Construct {
  public readonly apiUrl: string;

  constructor(scope: Construct, id: string, props: FrontendProps) {
    super(scope, id);

    const siteBucket = new s3.Bucket(this, "SiteBucket", {
      publicReadAccess: false,
      removalPolicy: RemovalPolicy.DESTROY,
      autoDeleteObjects: true,
    });

    const oai = new cloudfront.OriginAccessIdentity(
      this,
      "OriginAccessIdentity"
    );

    siteBucket.grantRead(oai);

    const distribution = new cloudfront.Distribution(this, "SiteDistribution", {
      certificate: props.certificate,
      defaultRootObject: "index.html",
      minimumProtocolVersion: cloudfront.SecurityPolicyProtocol.TLS_V1_2_2021,
      defaultBehavior: {
        origin: new cloudfront_origins.S3Origin(siteBucket, {
          originAccessIdentity: oai,
        }),
        compress: true,
        allowedMethods: cloudfront.AllowedMethods.ALLOW_GET_HEAD_OPTIONS,
        viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
      },
    });

    const config = {
      apiUrl: props.apiUrl,
      authUrl: props.authUrl
    };

    new s3deploy.BucketDeployment(this, "DeployWebsite", {
      sources: [
        s3deploy.Source.asset("./site"),
        s3deploy.Source.jsonData("config.json", config),
      ],
      destinationBucket: siteBucket,
      distribution: distribution,
      distributionPaths: ["/*"],
    });

    new CfnOutput(this, "DistributionDomain", {
      value: distribution.distributionDomainName,
    });

    this.apiUrl = props.apiUrl || "";
  }
}
