export const addErrorContext = (error: unknown, context: string) => {
  if (error instanceof Error) {
    error.message = `${context}: ${error.message}`;

    if (error instanceof ApplicationError && error.friendlyMessage) {
      error.friendlyMessage = `${context}: ${error.friendlyMessage}`;
    }
  }

  return error;
};

type ErrorArgs = string | { message: never; friendlyMessage: string } | { message: string; friendlyMessage: string };

export class ApplicationError extends Error {
  friendlyMessage?: string;
  status: number;

  constructor(args: ErrorArgs, status: number) {
    super(typeof args === 'string' ? args : args.message || args.friendlyMessage);

    this.friendlyMessage = typeof args === 'string' ? undefined : args.friendlyMessage;
    this.status = status;
  }
}

export const badRequestError = (args: ErrorArgs): ApplicationError => {
  return new ApplicationError(args, 400);
};

export const notAuthorizedError = (args: ErrorArgs): ApplicationError => {
  return new ApplicationError(args, 403);
};

export const notFoundError = (args: ErrorArgs): ApplicationError => {
  return new ApplicationError(args, 404);
};
