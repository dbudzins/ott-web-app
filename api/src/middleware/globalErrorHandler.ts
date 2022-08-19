import type { ErrorRequestHandler } from 'express';

const isProd = import.meta.env.PROD;

const globalErrorHandler: ErrorRequestHandler = async (error, _req, res, _next) => {
  console.error(error);
  const status = error.status || 500;

  res.status(status);

  if (isProd) {
    res.send(error.friendlyMessage || 'An unknown error occurred.');
  } else {
    res.send({
      status: status,
      message: error.message,
      friendlyMessage: error.friendlyMessage,
      stackTrace: error.stack.split('\n'),
    });
  }
};

export default globalErrorHandler;
