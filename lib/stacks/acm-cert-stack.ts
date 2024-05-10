// import * as acm from "aws-cdk-lib/aws-certificatemanager";
// import { Stack, StackProps, RemovalPolicy } from "aws-cdk-lib";
// import { Construct } from "constructs";

// export class CertStack extends Stack {
//   public readonly certificate: acm.Certificate;

//   constructor(scope: Construct, id: string, props?: StackProps) {
//     super(scope, id, props);

//     const certificate = new acm.Certificate(this, "siteCertificate", {
//       domainName: "example.com", // Replace with your domain name
//       validation: acm.CertificateValidation.fromDns(), // No hosted zone required
//     });

//     certificate.applyRemovalPolicy(RemovalPolicy.DESTROY);

//     this.certificate = certificate;
//   }
// }