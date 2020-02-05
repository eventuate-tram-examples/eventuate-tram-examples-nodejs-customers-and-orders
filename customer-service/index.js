const express = require('express');
const morgan = require('morgan');
const bodyParser = require('body-parser');
const customerCommandRoutes = require('./lib/customerCommandRoutes');
const { getLogger } = require('../common/logger');
const logger = getLogger({ title: 'todo-list-command-service' });

const app = express();
const port = process.env.TODO_LIST_COMMAND_PORT || 8079;

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use(morgan('dev'));
app.use('/customers', customerCommandRoutes);

//error handling
app.use(errorHandler);

app.listen(port, () => {
  logger.info(`Customer Service listening on ${port}`);
});

function errorHandler(err, req, res) {
  if (err) {
    logger.error(err);

    res.status(500).send({
      error: {
        message: err.message,
        stack: err.stack
      }
    });
  }
}
