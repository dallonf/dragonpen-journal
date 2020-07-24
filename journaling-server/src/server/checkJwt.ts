import jwt, { GetPublicKeyOrSecret } from 'jsonwebtoken';
import * as jwksRsa from 'jwks-rsa';
import { User } from '../model/user';

const client = jwksRsa({
  jwksUri: `https://${process.env.AUTH0_DOMAIN}/.well-known/jwks.json`,
});

const getKey: GetPublicKeyOrSecret = (header, callback) => {
  client.getSigningKey(header.kid!, (err, key) => {
    if (err) return callback(err);

    const signingKey = key.getPublicKey();
    callback(null, signingKey);
  });
};

export const validateTokenAndGetUser = (token: string): Promise<User> => {
  if (token) {
    const bearerToken = token.split(' ');

    return new Promise((resolve, reject) => {
      jwt.verify(
        bearerToken[1],
        getKey,
        {
          audience: process.env.AUTH0_IDENTIFIER,
          issuer: `https://${process.env.AUTH0_DOMAIN}/`,
          algorithms: ['RS256'],
        },
        (error, decoded) => {
          if (error) {
            reject(error);
          } else {
            resolve(decoded as User);
          }
        }
      );
    });
  } else {
    return Promise.reject(new Error('No token provided'));
  }
};
