const express = require('express');
const morgan = require('morgan');
const bodyParser = require('body-parser');
const customerCommandRoutes = require('./lib/customerCommandRoutes');
const { getLogger } = require('../common/logger');
const logger = getLogger({ title: 'customer-service' });
const orderEventHandlers = require('./lib/orderEventHandlers');
const { MessageConsumer, DomainEventDispatcher, DefaultDomainEventNameMapping } = require('eventuate-tram-core-nodejs');
const { createCustomerTable } = require('./lib/mysql/customerCrudService');
const { createCustomerCreditReservationsTable } = require('./lib/mysql/customerCreditReservationsCrudService');

const domainEventNameMapping = new DefaultDomainEventNameMapping();
const messageConsumer = new MessageConsumer();
const app = express();
const port = process.env.TODO_LIST_COMMAND_PORT || 8082;

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use(morgan('dev'));
app.use('/customers', customerCommandRoutes);
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
    await createCustomerTable();
  }  catch (e) {
    if (e.code !== 'ER_TABLE_EXISTS_ERROR') {
      logger.error(e);
      process.exit(1);
    }
  }

  try {
    await createCustomerCreditReservationsTable();
  }  catch (e) {
    if (e.code !== 'ER_TABLE_EXISTS_ERROR') {
      logger.error(e);
      process.exit(1);
    }
  }

  const domainEventDispatcher = new DomainEventDispatcher({
    eventDispatcherId: 'orderServiceEventsNode',
    domainEventHandlers: orderEventHandlers,
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
    logger.info(`Customer Service listening on ${port}`);
  });
})();
