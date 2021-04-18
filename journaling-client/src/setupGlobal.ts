import { enableMapSet } from "immer";
import process from "process";
enableMapSet();
globalThis.process = process;
