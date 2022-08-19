import type { RequestHandler } from 'express';
import type { NextFunction, Request, Response, ParamsDictionary } from 'express-serve-static-core';
import type { ParsedQs } from 'qs';

export interface UserIdentity {
  userId: string;
}

export interface AuthenticatedRequest<
  P = ParamsDictionary,
  ResBody = unknown,
  ReqBody = unknown,
  ReqQuery = ParsedQs,
  Locals extends Record<string, unknown> = Record<string, unknown>,
> extends Request<P, ResBody, ReqBody, ReqQuery, Locals> {
  userIdentity?: UserIdentity;
}

const authenticatedRequest = <
  P = ParamsDictionary,
  ResBody = unknown,
  ReqBody = unknown,
  ReqQuery = ParsedQs,
  Locals extends Record<string, unknown> = Record<string, unknown>,
>(
  handler: (req: AuthenticatedRequest<P, ResBody, ReqBody, ReqQuery, Locals>, res: Response, next: NextFunction) => void,
): RequestHandler<P, ResBody, ReqBody, ReqQuery, Locals> => {
  return (req, res, next) => {
    const authenticatedRequest = req as AuthenticatedRequest<P, ResBody, ReqBody, ReqQuery, Locals>;

    if (!authenticatedRequest.userIdentity) {
      (res as unknown as Response<string, Locals>).status(403).send('Not authenticated');
    } else if (!authenticatedRequest.userIdentity.userId) {
      (res as unknown as Response<string, Locals>).status(403).send('Not logged in');
    } else {
      handler(authenticatedRequest, res, next);
    }
  };
};

export default authenticatedRequest;
