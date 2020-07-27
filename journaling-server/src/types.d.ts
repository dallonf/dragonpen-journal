/// <reference types="node" />

declare namespace NodeJS {
  interface ProcessEnv {
    // Identifier of Auth0 API for this app
    readonly AUTH0_IDENTIFIER: string;
    readonly AUTH0_DOMAIN: string;
    // URL to ElasticSearch node
    readonly ELASTIC_NODE: string;
    readonly REPL_USER_ID?: string;
  }
}
