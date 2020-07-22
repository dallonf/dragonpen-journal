require('ts-node').register({ transpileOnly: true });
const { buildSchemaFromTypeDefinitions } = require('apollo-server');
const schema = require('../src/schema');

module.exports = buildSchemaFromTypeDefinitions(schema.typeDefs);
