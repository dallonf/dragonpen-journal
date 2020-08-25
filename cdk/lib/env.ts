import * as env from './env.json';

export interface EnvConfig {
  envName: string;
  route53HostedZoneDomain: string;
  route53HostedZoneId: string;
  httpsCertArn: string;
  appDomain: string;
  auth0Domain: string;
  auth0ClientId: string;
  auth0ApiId: string;
  apiDomain: string;
  gqlUrl: string;
  appUrl: string;
  ephemeralData: boolean;

  dynamoTableNames: {
    JournalEntries: string;
  };
}

export const loadEnvConfig = (): EnvConfig => env;
