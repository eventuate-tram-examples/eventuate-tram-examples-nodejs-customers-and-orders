const log4js = require('log4js');

module.exports.getLogger = ({ logLevel, title = 'customer-and-orders' } = {}) => {

  const logger = log4js.getLogger(title);

  if (!logLevel) {
    logLevel = (process.env.NODE_ENV !== 'production') ? 'DEBUG' : 'ERROR';
  }

  logger.level = logLevel;

  return logger;
};
