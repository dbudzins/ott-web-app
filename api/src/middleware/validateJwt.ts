import type { RequestHandler } from 'express';

import cleengJwtParser from '#src/services/cleengJwtValidationServices';
import { addErrorContext, badRequestError } from '#src/utils/applicationError';
import type { AuthenticatedRequest } from '#src/utils/authenticatedRequest';

export interface TokenData {
  expirationSeconds: number;
  userIdentity: UserIdentity;
}

type ParserFunction = (token: string) => Promise<TokenData> | TokenData;

const parsers: { [key: string]: ParserFunction } = {
  cleeng: cleengJwtParser,
};

/***
 * This middleware reads, verifies, and decodes the jwt from the Authorization header
 * @param req the request
 * @param res the response
 * @param next the next pipeline
 */
const validateJwt: RequestHandler = async (req, res, next) => {
  const authHeader = req.header('Authorization');
  const authProvider = req.header('Auth-Provider');

  if (authHeader != undefined) {
    if (!authHeader.startsWith('Bearer ')) {
      return next(badRequestError('Auth header missing "Bearer" prefix.'));
    }

    if (!authProvider) {
      return next(badRequestError('Missing auth-provider header'));
    }

    const parser = parsers[authProvider];

    if (!parser) {
      return next(badRequestError(`Could not find JWT parser for auth-provider=${authProvider}. ` + `Valid options are: ${Object.keys(parsers)}`));
    }

    try {
      const token = authHeader.substring(7);

      // TODO: Should validate token using public key if available instead of just decoding it
      const tokenData = await parser(token);

      if (Date.now() > tokenData.expirationSeconds * 1000) {
        res.status(400).send('Expired token');
        return;
      } else {
        (req as AuthenticatedRequest).userIdentity = tokenData.userIdentity;
      }
    } catch (error: unknown) {
      next(addErrorContext(error, 'Invalid JWT Auth Token'));
    }
  }

  next();
};

export default validateJwt;
