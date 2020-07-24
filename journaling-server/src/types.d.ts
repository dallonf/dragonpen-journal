/// <reference types="node" />

declare namespace NodeJS {
  interface ProcessEnv {
    readonly AUTH0_IDENTIFIER: string;
    readonly AUTH0_DOMAIN: string;
  }
}