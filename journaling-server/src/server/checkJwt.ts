import { verify, GetPublicKeyOrSecret } from 'jsonwebtoken';
import jwksRsa from 'jwks-rsa';
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

interface DecodedJwt {
  name?: string;
  sub: string;
  iat: number;
  exp: number;
}

export const validateTokenAndGetUser = (token: string): Promise<User> => {
  if (token) {
    const bearerToken = token.split(' ');

    return new Promise((resolve, reject) => {
      verify(
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
            const decodedJwt = (decoded as unknown) as DecodedJwt;
            resolve({
              id: decodedJwt.sub,
              name: decodedJwt.name,
            });
          }
        }
      );
    });
  } else {
    return Promise.reject(new Error('No token provided'));
  }
};
