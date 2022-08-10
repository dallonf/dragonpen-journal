const { buildSchema } = require("graphql");
const fs = require("fs");
const path = require("path");

let schemaSrc = fs.readFileSync(
  path.join(__dirname, "../src/schema.ts"),
  "utf-8"
);
const startLine = "export const typeDefs = gql`";
const endLine = "`;";

const startIndex = schemaSrc.indexOf(startLine);
if (startIndex === -1)
  throw new Error(`Couldn't find "${startLine}" in schema.ts`);
schemaSrc = schemaSrc.substring(startIndex + startLine.length);

const endIndex = schemaSrc.indexOf(endLine);
if (endIndex === -1) throw new Error(`Couldn't find "${endLine}" in schema.ts`);
schemaSrc = schemaSrc.substring(0, endIndex);

module.exports = buildSchema(schemaSrc);
