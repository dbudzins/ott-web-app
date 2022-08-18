import express from 'express';

const router = express.Router();

router.get('/', (req, res) => {
  const target = req.query['name'] || 'World';
  res.send(`Hello ${target}!\n`);
});

export default router;
