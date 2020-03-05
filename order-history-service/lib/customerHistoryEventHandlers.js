const { getLogger } = require('../../common/logger');
const {
  CustomerEntityTypeName,
  CustomerCreatedEvent
} = require('../../common/eventsConfig');

const logger = getLogger({ title: 'order-history-service' });

module.exports = {
  [CustomerEntityTypeName]: {
    [CustomerCreatedEvent]: (event) => {
      logger.debug('event:', event);
      try {
        const payload = JSON.parse(event.payload);

      } catch (err) {
        return Promise.reject(err);
      }
    }
  }
};
