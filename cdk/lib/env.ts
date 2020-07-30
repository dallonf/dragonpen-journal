import { parse } from 'dotenv';
import { readFileSync } from 'fs';

type EnvironmentName = 'staging';

export interface EnvConfig {
  AUTH0_API_IDENTIFIER: string;
  AUTH0_DOMAIN: string;
  AUTH0_CLIENT_ID: string;
  R53_HOSTED_ZONE_ID: string;
  DOMAIN: string;
  HOST_PREFIX?: string;
  ARN_HTTPS_CERT: string;
}

export const defaultEnv = parse(readFileSync('.env', 'utf-8')) as Partial<
  EnvConfig
>;

export const getEnvConfig = (envName: EnvironmentName) =>
  ({
    ...defaultEnv,
    ...parse(readFileSync(`.env.${envName}`)),
  } as EnvConfig);

export const getDomainName = (envConfig: EnvConfig, ...names: string[]) =>
  ['journal', ...names, envConfig.HOST_PREFIX ?? null]
    .filter((x) => x)
    .join('-') +
  '.' +
  envConfig.DOMAIN;
