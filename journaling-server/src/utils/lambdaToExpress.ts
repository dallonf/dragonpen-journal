import * as qs from 'qs';
import {
  APIGatewayProxyEventV2,
  APIGatewayProxyStructuredResultV2,
} from 'aws-lambda';
import { Handler as ExpressHandler } from 'express';
import rawBody from 'raw-body';

type LambdaHandler = (
  event: APIGatewayProxyEventV2
) => Promise<APIGatewayProxyStructuredResultV2>;

export const makeExpressHandler = (lambda: LambdaHandler): ExpressHandler => (
  req,
  res,
  next
) => {
  const querystring = req.url.split('?')[1] ?? '';

  rawBody(req, { encoding: 'utf-8' })
    // new Promise((resolve, reject) => {
    //   const chunks: Uint8Array[] = [];
    //   req.on('data', (chunk) => chunks.push(chunk));
    //   req.on('error', reject);
    //   req.on('end', () => {
    //     resolve(Buffer.concat(chunks).toString('utf-8'));
    //   });
    // })
    .then((body) =>
      lambda({
        headers: (req.headers as unknown) as {
          [key: string]: string;
        },
        isBase64Encoded: false,
        rawPath: req.path,
        rawQueryString: querystring,
        requestContext: ({} as unknown) as APIGatewayProxyEventV2['requestContext'],
        routeKey: req.path,
        version: '1',
        body,
        cookies: req.cookies,
        pathParameters: req.params,
        queryStringParameters: (qs.parse(querystring) as unknown) as {
          [key: string]: string;
        },
      })
    )
    .then((result) => {
      const { headers, cookies, statusCode, body, isBase64Encoded } = result;
      if (statusCode) {
        res.status(statusCode);
      }
      if (cookies) {
        throw new Error('cookies not supported');
      }
      if (isBase64Encoded) {
        throw new Error('isBase64Encoded not supported');
      }
      if (headers) {
        Object.keys(headers).forEach((k) => {
          let val = headers[k];
          if (typeof val == 'number' || typeof val == 'boolean') {
            val = val.toString();
          }
          res.header(k, val);
        });
      }

      res.send(body);
    })
    .catch(next);
};
