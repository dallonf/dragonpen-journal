require('dotenv/config');

module.exports = {
  development: {
    client: 'postgresql',
    connection: {
      // TODO: parameterize
      database: 'postgres',
      user: 'postgres',
      password: 'password',
    },
    pool: {
      min: 2,
      max: 10,
    },
    migrations: {
      tableName: 'knex_migrations',
    },
  },
};
