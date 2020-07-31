require('dotenv/config');
require('ts-node').register();
const { default: createModel } = require('../src/model');

global.repl = {
  model: createModel({ id: process.env.REPL_USER_ID, name: 'Repl User' }),
};
