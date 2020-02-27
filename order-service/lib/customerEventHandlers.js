const { getLogger } = require('../../common/logger');
const {
  CustomerEntityTypeName,
  CustomerCreditReservationFailedEvent,
  CustomerValidationFailedEvent,
  CustomerCreditReservedEvent
} = require('../../common/eventsConfig');
const orderService = require('./orderService.js');

const logger = getLogger({ title: 'customer-service' });

module.exports = {
  [CustomerEntityTypeName]: {
    [CustomerCreditReservedEvent]: (event) => {
      logger.debug('event:', event);
      try {
        const payload = JSON.parse(event.payload);
        const { orderId } = payload;

        return orderService.approveOrder(orderId);
      } catch (err) {
        return Promise.reject(err);
      }
    },
    [CustomerCreditReservationFailedEvent]: (event) => {
      logger.debug('event:', event);
      try {
        const payload = JSON.parse(event.payload);
        const { orderId } = payload;
        return orderService.approveOrder(orderId);
      } catch (err) {
        return Promise.reject(err);
      }
    },
    [CustomerValidationFailedEvent]: (event) => {
      logger.debug('event:', event);
      try {
        const payload = JSON.parse(event.payload);
        const { orderId } = payload;
        return orderService.rejectOrder(orderId);
      } catch (err) {
        return Promise.reject(err);
      }
    }
  }
};
