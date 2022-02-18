require("ts-node").register({ transpileOnly: true });
const { buildASTSchema } = require("graphql");
const schema = require("../src/schema");

module.exports = buildASTSchema(schema.typeDefs);
