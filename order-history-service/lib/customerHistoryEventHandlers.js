const { eventMessageHeaders: { AGGREGATE_ID } } = require('eventuate-tram-core-nodejs');
const { getLogger } = require('../../common/logger');
const {
  CustomerEntityTypeName,
  CustomerCreatedEvent
} = require('../../common/eventsConfig');
const { createCustomer } = require('./customerHistoryService');

const logger = getLogger({ title: 'order-history-service' });

module.exports = {
  [CustomerEntityTypeName]: {
    [CustomerCreatedEvent]: (event) => {
      logger.debug('event:', event);
      const { [AGGREGATE_ID]: customerId, payload: { name, creditLimit: { amount } }} = event;
      return createCustomer({ id: customerId, name, creditLimit: amount });
    }
  }
};
