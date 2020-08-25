import { env } from 'process';

const config = {
  client: 'postgresql',
  connection: {
    // TODO: config file
    host: process.env.PG_HOST,
    database: process.env.PG_DB,
    user: process.env.PG_USERNAME,
    password: process.env.PG_PASWORD,
  },
  pool: {
    min: 2,
    max: 10,
  },
  migrations: {
    tableName: 'knex_migrations',
  },
};

module.exports = {
  development: config,
  production: config,
};
