const express = require('express');
const morgan = require('morgan');
const { getLogger } = require('common-module/logger');
const bodyParser = require('body-parser');
const orderCommandRoutes = require('./lib/orderCommandRoutes');
const logger = getLogger({ title: 'order-service' });
const { createOrdersTable } = require('./lib/mysql/orderCrudService');
const customerEventHandlers = require('./lib/customerEventHandlers');
const { MessageConsumer, DomainEventDispatcher, DefaultDomainEventNameMapping } = require('eventuate-tram-core-nodejs');

const domainEventNameMapping = new DefaultDomainEventNameMapping();
const messageConsumer = new MessageConsumer();
const app = express();
const port = process.env.ORDER_SERVICE_PORT || 8081;

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
    await createOrdersTable();
  }  catch (e) {
    if (e.code !== 'ER_TABLE_EXISTS_ERROR') {
      logger.error(e);
      process.exit(1);
    }
  }

  const domainEventDispatcher = new DomainEventDispatcher({
    eventDispatcherId: 'customerServiceEventsNode',
    domainEventHandlers: customerEventHandlers,
    messageConsumer,
    domainEventNameMapping
  });

  try {
    await domainEventDispatcher.initialize();
  } catch (e) {
    logger.error(e);
    process.exit(1);
  }

  app.listen(port, () => {
    logger.info(`Order Service listening on ${port}`);
  });
})();
