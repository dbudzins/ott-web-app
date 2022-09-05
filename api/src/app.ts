import express from 'express';

import defaultRouter from '#src/routes/deafultRoutes';
import validateJwt from '#src/middleware/validateJwt';
import globalErrorHandler from '#src/middleware/globalErrorHandler';

const app = express();

app.use('/', validateJwt);
app.use('/', defaultRouter);

app.get('/', (_req, res) => {
  res.status(404).send('Not Found. :-(');
});

app.use('/', globalErrorHandler);

// This is used by the vite-node-plugin to run the dev server.
if (import.meta.env.PROD) {
  const port = process.env.PORT || 3000;

  app.listen(port, () => {
    console.info('Listening on port', port);
  });
}

// This is used by the vite-node-plugin to run the dev server.
// See https://github.com/axe-me/vite-plugin-node#get-started
// noinspection JSUnusedGlobalSymbols
export const viteNodeApp = app;
