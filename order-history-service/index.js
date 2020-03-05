const express = require('express');
const morgan = require('morgan');
const bodyParser = require('body-parser');
const orderCommandRoutes = require('./lib/orderCommandRoutes');
const { connectMongoDb } = require('./lib/mongoDb/db');
const { getLogger } = require('../common/logger');
const logger = getLogger({ title: 'order-history-service' });

const app = express();
const port = process.env.CUSTOMER_SERVICE_PORT || 8083;

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use(morgan('dev'));
app.use('/orders', orderCommandRoutes);
app.get('/actuator/health', (req, res) => {
  res.status(200).send('OK');
});

//error handling
app.use((err, req, res) => {
  if (err) {
    logger.error(err);

    res.status(500).send({
      error: {
        message: err.message,
        stack: err.stack
      }
    });
  }
});

(async function () {

  try {
    await connectMongoDb();
  } catch (e) {
    logger.error(e);
    process.exit(1);
  }

  app.listen(port, () => {
    logger.info(`Order History Service listening on ${port}`);
  });
})();
