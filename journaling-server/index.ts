import * as http from 'http';
import * as qs from 'querystring';
import type * as expressTypes from 'express';
import axios from 'axios';
import { makeExpressHandler } from './src/utils/lambdaToExpress';
import { handler as helloHandler } from './src/handlers/hello';
import { handler as gqlHandler } from './src/handlers/gql';

const express = require('express') as () => expressTypes.Express;

const app = express();
app.get('/', (req, res) => {
  res.json({ healthy: true });
});

app.get('/hello', makeExpressHandler(helloHandler));
app.post('/graphql', makeExpressHandler(gqlHandler));

// TODO: this might be better for env
const baseUrl = 'http://localhost:4000';

if (process.env.NODE_ENV === 'development') {
  app.get('/jwt', (req, res, next) => {
    (async () => {
      const code = req.param('code');

      if (code) {
        const response = await axios.post(
          `https://${process.env.AUTH0_DOMAIN}/oauth/token`,
          qs.encode({
            grant_type: 'authorization_code',
            client_id: process.env.AUTH0_TEST_CLIENT_ID,
            client_secret: process.env.AUTH0_TEST_CLIENT_SECRET,
            redirect_uri: `${baseUrl}/jwt`,
            code,
          }),
          {}
        );
        res.send(`Bearer ${response.data.access_token}`);
      } else {
        const url = `https://${process.env.AUTH0_DOMAIN}/authorize?${qs.encode({
          audience: process.env.AUTH0_IDENTIFIER,
          response_type: 'code',
          client_id: process.env.AUTH0_TEST_CLIENT_ID,
          redirect_uri: `${baseUrl}/jwt`,
        })}`;
        res.redirect(url);
      }
    })().catch(next);
  });
}

const httpServer = http.createServer(app);
const port = process.env.PORT || 4000;
httpServer.listen(port, () => {
  console.log(`Listening on http://localhost:${port}`);
});
