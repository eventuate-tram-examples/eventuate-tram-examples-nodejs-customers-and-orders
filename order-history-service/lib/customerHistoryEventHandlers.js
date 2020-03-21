const { eventMessageHeaders: { AGGREGATE_ID } } = require('eventuate-tram-core-nodejs');
const { getLogger } = require('common-module/logger');
const {
  CustomerEntityTypeName,
  CustomerCreatedEvent,
  OrderEntityTypeName,
  OrderCreatedEvent,
  OrderApprovedEvent,
  OrderRejectedEvent,
  OrderCancelledEvent
} = require('common-module/eventsConfig');
const { createOrUpdateCustomer, createOrUpdateOrder, updateCustomerAndOrderViewState } = require('./orderHistoryService');

const logger = getLogger({ title: 'order-history-service' });

module.exports = {
  [CustomerEntityTypeName]: {
    [CustomerCreatedEvent]: (event) => {
      logger.debug('event:', event);
      const { [AGGREGATE_ID]: customerId, payload: { name, creditLimit }} = event;
      return createOrUpdateCustomer({ id: customerId, name, creditLimit });
    }
  },
  [OrderEntityTypeName]: {
    [OrderCreatedEvent]: async (event) => {
      logger.debug('event:', event);
      const { [AGGREGATE_ID]: orderId, payload: { orderDetails: { orderTotal, customerId }} } = event;
      return updateCustomerAndOrderViewState({ orderId, customerId, orderTotal, state: 'PENDING' });
    },
    [OrderApprovedEvent]: async (event) => {
      logger.debug('event:', event);
      const { [AGGREGATE_ID]: orderId, payload: { orderDetails: { orderTotal, customerId }} } = event;
      return updateCustomerAndOrderViewState({ orderId, customerId, orderTotal, state: 'APPROVED' });
    },
    [OrderRejectedEvent]: async (event) => {
      logger.debug('event:', event);
      const { [AGGREGATE_ID]: orderId, payload: { orderDetails: { orderTotal, customerId }} } = event;
      return updateCustomerAndOrderViewState({ orderId, customerId, orderTotal, state: 'REJECTED' });
    },
    [OrderCancelledEvent]: async (event) => {
      logger.debug('event:', event);
      const { [AGGREGATE_ID]: orderId, payload: { orderDetails: { orderTotal, customerId }} } = event;
      return updateCustomerAndOrderViewState({ orderId, customerId, orderTotal, state: 'CANCELLED' });
    }
  }
};
