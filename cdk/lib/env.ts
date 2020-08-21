import * as yup from 'yup';

const schema = yup
  .object()
  .required()
  .shape({
    envName: yup.string().required(),
    route53HostedZoneDomain: yup.string().required(),
    route53HostedZoneId: yup.string().required(),
    httpsCertArn: yup.string().required(),
    appDomain: yup.string().required(),
    auth0Domain: yup.string().required(),
    auth0ClientId: yup.string().required(),
    auth0ApiId: yup.string().required(),
    apiDomain: yup.string().required(),
    gqlUrl: yup.string().required(),
    appUrl: yup.string().required(),
    ephemeralData: yup.bool().required(),

    dynamoTableNames: yup.object().required().shape({
      JournalEntries: yup.string().required(),
    }),
  });

export type EnvConfig = yup.InferType<typeof schema>;

export const loadEnvConfig = () => schema.cast(require('../../env/env.json'))!;
