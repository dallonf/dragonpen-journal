require('dotenv/config');
require('ts-node').register();
const { default: createModel } = require('../src/model');
const env = require('../src/env.json');

global.repl = {
  model: createModel({ id: env.replUserId, name: 'Repl User' }),
};
