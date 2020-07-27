import { Client } from '@elastic/elasticsearch';

export const makeClient = () => {
  const client = new Client({
    node: process.env.ELASTIC_NODE,
  });
  return client;
};
