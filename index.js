/* eslint-disable global-require */
const express = require('express');
const cors = require('cors');

const collections = {
  homes: require('./data/homes.json'),
};

const app = express();
const router = express.Router();

router.get('/homes', (req, res) => {
  const { limit = 32, offset = 0 } = req.query;

  if (collections.homes) {
    const items = collections.homes;

    res.send({
      items: [...items].splice(offset, limit),
      total: items.length,
      limit: Number(limit),
      offset: Number(offset),
    });
  } else {
    res.sendStatus(404);
  }
});

app.use(cors());
app.use('/v1', router);
app.get('/', (req, res) => {
  res.send({
    docs: 'https://github.com/evgenyrodionov/airbnb-demo-api',
    version: `1.0.0-${process.env.BUILD_DATE || 'local'}`,
    routes: ['/v1/homes'],
  });
});

app.listen(3000, () => {
  console.log('airbnb-demo-api listening on port 3000!'); // eslint-disable-line no-console
});
