require('dotenv/config');
const fs = require('fs');
const path = require('path');
const yup = require('yup');
const lodash = require('lodash');

const envSchema = yup.object().required().shape({
  ENV_NAME: yup.string().required(),
  EPHEMERAL_DATA: yup.string(),
  // The port for the API on localhost
  LOCALHOST_API: yup.string(),
  // The port for the API on localhost
  LOCALHOST_APP: yup.string(),

  DEBUG: yup.string(),

  REPL_USER_ID: yup.string(),
  AUTH0_TEST_CLIENT_ID: yup.string(),
  AUTH0_TEST_CLIENT_SECRET: yup.string(),
});

const sourceEnv = envSchema.cast(process.env);

console.log('Collecting environment information');

const DOMAIN_NAME = 'dallonf.com';
const {
  ENV_NAME,
  DEBUG,
  EPHEMERAL_DATA,
  LOCALHOST_API,
  LOCALHOST_APP,
} = sourceEnv;
const hostPrefix = ENV_NAME == 'production' ? null : ENV_NAME;

const getDomainName = (...names) =>
  ['journal', ...names, hostPrefix ?? null].filter((x) => x).join('-') +
  '.' +
  DOMAIN_NAME;

const getDynamoTableName = (name) => `${name}-${ENV_NAME}`;

const apiDomain = LOCALHOST_API
  ? `localhost:${LOCALHOST_API}`
  : getDomainName('api');
const appDomain = LOCALHOST_APP
  ? `localhost:${LOCALHOST_APP}`
  : getDomainName();

const dynamoTableNames = Object.fromEntries(
  ['JournalEntries'].map((x) => [x, getDynamoTableName(x)])
);

const output = {
  envName: ENV_NAME,
  auth0Domain: 'dallonf.auth0.com',
  auth0ClientId: 'njBUh8oOFZe099w5nkxY0IqFY8aHO1O1',
  auth0ApiId: 'https://api.journal.dallonf.com',
  route53HostedZoneDomain: DOMAIN_NAME,
  route53HostedZoneId: 'Z2T9RQTFXUZ2GU',
  httpsCertArn:
    'arn:aws:acm:us-east-1:784929213598:certificate/3c1b588a-eb2a-4fb5-9f0c-7113796c9884',

  appDomain,
  appUrl: `${LOCALHOST_APP ? 'http' : 'https'}://${appDomain}`,
  apiDomain,
  gqlUrl: `${LOCALHOST_API ? 'http' : 'https'}://${apiDomain}/graphql`,
  ephemeralData: Boolean(EPHEMERAL_DATA),

  dynamoTableNames,
};

if (DEBUG) {
  console.log(JSON.stringify(output, null, 2));
} else {
  const outputJson = JSON.stringify(output);
  ['cdk/lib'].forEach((outputPath) => {
    fs.writeFileSync(
      path.join(__dirname, '..', outputPath, 'env.json'),
      outputJson
    );
  });

  // Only send a handful of config options to the client,
  // so that secrets don't get compiled into the front-end source
  const clientOutputJson = JSON.stringify(
    lodash.pick(output, [
      'auth0Domain',
      'auth0ClientId',
      'auth0ApiId',
      'gqlUrl',
    ])
  );
  fs.writeFileSync(
    path.join(__dirname, '../journaling-client/src/env.json'),
    clientOutputJson
  );
}
