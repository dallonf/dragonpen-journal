import { Client } from '@elastic/elasticsearch';

export const makeClient = () => {
  const client = new Client({
    // TODO: need to parameterize this for deployment
    node: 'http://localhost:9200',
  });
  return client;
};
