const express = require('express');
const morgan = require('morgan');
const bodyParser = require('body-parser');
const customerCommandRoutes = require('./lib/customerCommandRoutes');
const { getLogger } = require('../common/logger');
const logger = getLogger({ title: 'customer-service' });
const orderEventHandlers = require('./lib/orderEventHandlers');
const { MessageConsumer, DomainEventDispatcher, DefaultDomainEventNameMapping } = require('eventuate-tram-core-nodejs');

const domainEventNameMapping = new DefaultDomainEventNameMapping();
const messageConsumer = new MessageConsumer();
const app = express();
const port = process.env.TODO_LIST_COMMAND_PORT || 8079;

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use(morgan('dev'));
app.use('/customers', customerCommandRoutes);

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
