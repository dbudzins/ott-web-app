import jwt from 'jsonwebtoken';

import type { TokenData } from '#src/middleware/validateJwt';
import { badRequestError } from '#src/utils/applicationError';
import type { UserIdentity } from '#src/utils/authenticatedRequest';

export interface CleengUserIdentity extends UserIdentity {
  providerId: string;
}

interface CleengTokenData {
  customerId?: string;
  publisherId?: string;
  exp?: number;
}

const allowedPublishers = import.meta.env.APP_CLEENG_ALLOWED_PUBLISHERS.split(',');
const parseToken = (token: string): TokenData => {
  // TODO: Get the public key from Cleeng so we can verify the jwt instead of just decoding
  const cleengData = jwt.decode(token) as CleengTokenData;

  if (!cleengData) {
    throw badRequestError('No cleeng data');
  }

  if (!cleengData.exp) {
    throw badRequestError('Token is missing the exp (expiration) property');
  }

  if (!cleengData.customerId) {
    throw badRequestError('The Cleeng Token is missing the customerId property');
  }

  if (!cleengData.publisherId) {
    throw badRequestError('The Cleeng Token is missing the publisherId property');
  }

  if (!allowedPublishers.includes(`${cleengData.publisherId}`)) {
    throw badRequestError(`Unexpected Publisher ID: ${cleengData.publisherId}. Valid options are: ${allowedPublishers}`);
  }

  const userIdentity: CleengUserIdentity = {
    userId: cleengData.customerId,
    providerId: cleengData.publisherId,
    jwt: token
  };

  return {
    userIdentity: userIdentity,
    expirationSeconds: cleengData.exp,
  };
};

export default parseToken;
