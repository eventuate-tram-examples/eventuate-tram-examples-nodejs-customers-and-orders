const { getLogger } = require('common-module/logger');
const {
  CustomerEntityTypeName,
  CustomerCreditReservationFailedEvent,
  CustomerValidationFailedEvent,
  CustomerCreditReservedEvent
} = require('common-module/eventsConfig');
const orderService = require('./orderService.js');

const logger = getLogger({ title: 'customer-service' });

module.exports = {
  [CustomerEntityTypeName]: {
    [CustomerCreditReservedEvent]: (event) => {
      logger.debug('event:', event);
      const { payload: { orderId }} = event;
      return orderService.approveOrder(orderId);
    },
    [CustomerCreditReservationFailedEvent]: (event) => {
      logger.debug('event:', event);
      const { payload: { orderId }} = event;
      return orderService.rejectOrder(orderId);
    },
    [CustomerValidationFailedEvent]: (event) => {
      logger.debug('event:', event);
      const { payload: { orderId }} = event;
      return orderService.rejectOrder(orderId);
    }
  }
};
