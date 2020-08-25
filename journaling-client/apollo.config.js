module.exports = {
  client: {
    service: {
      name: 'dragonpen-api',
      localSchemaFile: '../journaling-server/graphql.schema.json',
      url: 'http://localhost:4000/graphql',
    },
  },
};
