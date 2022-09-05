import type { UserIdentity } from '#src/utils/authenticatedRequest';

declare namespace Express {
  export interface Request {
    userIdentity?: UserIdentity;
  }
}

declare module 'express-serve-static-core' {
  interface Request {
    userIdentity?: UserIdentity;
  }
}
