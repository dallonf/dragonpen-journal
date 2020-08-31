const { createProxyMiddleware } = require('http-proxy-middleware');
const env = require('./env.json');

module.exports = function (app) {
  app.use(
    '/graphql',
    createProxyMiddleware({
      target: env.gqlUrl,
      changeOrigin: true,
      prependPath: false,
    })
  );
};
