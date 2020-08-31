import * as http from 'http';
import * as qs from 'querystring';
import type * as expressTypes from 'express';
import axios from 'axios';
import cors from 'cors';
import morgan from 'morgan';
import { makeExpressHandler } from './src/utils/lambdaToExpress';
import { handler as gqlHandler } from './src/handlers/gql';
import * as env from './src/env.json';

const express = require('express') as () => expressTypes.Express;

const app = express();
app.use(morgan('dev'));
app.use(cors());

app.get('/', (req, res) => {
  res.json({ healthy: true });
});

app.post('/graphql', makeExpressHandler(gqlHandler));

// TODO: this might be better for env
const baseUrl = 'http://localhost:4000';

if (process.env.NODE_ENV === 'development') {
  app.get('/jwt', (req, res, next) => {
    (async () => {
      const code = req.param('code');

      if (code) {
        const response = await axios.post(
          `https://${env.auth0Domain}/oauth/token`,
          qs.encode({
            grant_type: 'authorization_code',
            client_id: env.auth0TestClientId,
            client_secret: env.auth0TestClientSecret,
            redirect_uri: `${baseUrl}/jwt`,
            scope: 'openid profile email',
            code,
          }),
          {}
        );
        res.send(`Bearer ${response.data.access_token}`);
      } else {
        const url = `https://${env.auth0Domain}/authorize?${qs.encode({
          audience: env.auth0ApiId,
          response_type: 'code',
          client_id: env.auth0TestClientId,
          redirect_uri: `${baseUrl}/jwt`,
          scope: 'openid profile email',
        })}`;
        res.redirect(url);
      }
    })().catch(next);
  });
}

const httpServer = http.createServer(app);
// I suspect I may be seeing something to this effect locally
// https://github.com/microsoft/WSL/issues/4769
httpServer.keepAliveTimeout = 0;
const port = process.env.PORT || 4000;
httpServer.listen(port, () => {
  console.log(`Listening on http://localhost:${port}`);
});
