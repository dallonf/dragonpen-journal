require('ts-node').register();
const { default: createModel } = require('../src/model');

global.repl = {
  model: createModel(),
};