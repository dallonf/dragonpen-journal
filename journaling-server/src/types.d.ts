/// <reference types="node" />

declare namespace NodeJS {
  interface ProcessEnv {
    readonly NODE_ENV: 'development' | 'production';
    /** Identifier of Auth0 API for this app */
    readonly AUTH0_IDENTIFIER: string;
    readonly AUTH0_DOMAIN: string;
    /** URL to ElasticSearch node */
    readonly ELASTIC_NODE: string;
    readonly REPL_USER_ID?: string;
    /** For /jwt flow. Only used in development. */
    readonly AUTH0_TEST_CLIENT_ID?: string;
    /** For /jwt flow. Only used in development. */
    readonly AUTH0_TEST_CLIENT_SECRET?: string;
  }
}
