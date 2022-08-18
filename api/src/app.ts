import express from 'express';

import mediaRouter from '#src/routes/media';

const app = express();

app.use('/media', mediaRouter);

app.get('/', (_req, res) => {
  res.status(404).send('Not Found. :-(');
});

// This is used by the vite-node-plugin to run the dev server.
if (import.meta.env.PROD) {
  const port = process.env.PORT || 3000;

  app.listen(port, () => {
    console.info('Hello world listening on port', port);
  });
}

// This is used by the vite-node-plugin to run the dev server.
// See https://github.com/axe-me/vite-plugin-node#get-started
// noinspection JSUnusedGlobalSymbols
export const viteNodeApp = app;
