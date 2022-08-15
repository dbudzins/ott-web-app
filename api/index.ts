import express from 'express';

const app = express();

app.get('/', (req, res) => {
  console.info('Hello world received a request.');

  const target = req.query['name'] || 'World';
  res.send(`Hello ${target}!\n`);
});

const port = process.env.PORT;
app.listen(port, () => {
  console.info('Hello world listening on port', port);
});
