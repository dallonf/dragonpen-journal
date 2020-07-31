const knex = require('knex');

export const makeClient = () =>
  knex({
    client: 'pg',
    connection: {
      // TODO: parameterize
      host: '127.0.0.1',
      user: 'postgres',
      password: 'password',
      database: 'postgres',
    },
  });
