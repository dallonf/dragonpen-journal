import { enableMapSet } from "immer";
import process from "process";

declare module globalThis {
  export let process: any;
}

enableMapSet();
globalThis.process = process;
