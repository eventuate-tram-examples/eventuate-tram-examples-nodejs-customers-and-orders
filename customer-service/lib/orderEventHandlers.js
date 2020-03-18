const { DomainEventPublisher, DefaultChannelMapping, MessageProducer, eventMessageHeaders: { AGGREGATE_ID } } = require('eventuate-tram-core-nodejs');
const { withTransaction } = require('../../common/mysql/utils');
const { getCustomer } = require('./customerService');
const {
  OrderEntityTypeName,
  OrderCreatedEvent,
  OrderCancelledEvent,
  CustomerEntityTypeName,
  CustomerCreditReservationFailedEvent,
  CustomerValidationFailedEvent,
  CustomerCreditReservedEvent
} = require('../../common/eventsConfig');
const { insertCustomerReservation, deleteCustomerReservation } = require('./mysql/customerCreditReservationsCrudService');

const { getLogger } = require('../../common/logger');
const logger = getLogger({ title: 'customer-service' });

const channelMapping = new DefaultChannelMapping(new Map());
const messageProducer = new MessageProducer({ channelMapping });
const domainEventPublisher = new DomainEventPublisher({ messageProducer });

function publishCustomerValidationFailedEvent(orderId, customerId, trx) {
  logger.error('Non-existent customer', { orderId, customerId });
  const customerValidationFailedEvent = { orderId, _type: CustomerValidationFailedEvent };
  return domainEventPublisher.publish(CustomerEntityTypeName,
    customerId,
    [ customerValidationFailedEvent ],
    { trx }
  );
}

module.exports = {
  [OrderEntityTypeName]: {
    [OrderCreatedEvent]: async (event) => {
      logger.debug('event:', event);
      const { [AGGREGATE_ID]: orderId } = event;

      return withTransaction(async (trx) => {
        const { payload: { orderDetails: { orderTotal: { amount }, customerId }} } = event;

        if (typeof (customerId) === 'undefined') {
          return publishCustomerValidationFailedEvent(orderId, String(customerId));
        }

        const customer = await getCustomer(customerId, trx);

        if (!customer) {
          return publishCustomerValidationFailedEvent(orderId, customerId, trx);
        }

        try {
          customer.reserveCredit(orderId, amount);
        } catch (err) {
          if (err.message === 'CustomerCreditLimitExceededException') {
            const customerCreditReservationFailedEvent = { _type: CustomerCreditReservationFailedEvent, orderId };
            return domainEventPublisher.publish(CustomerEntityTypeName, customerId, [ customerCreditReservationFailedEvent ]);
          }

          throw err;
        }

        await insertCustomerReservation(customer.id, amount, orderId, { trx });

        const customerCreditReservedEvent = { _type: CustomerCreditReservedEvent, orderId: Number(orderId) };

        return domainEventPublisher.publish(CustomerEntityTypeName,
          customerId,
          [ customerCreditReservedEvent ],
          { trx }
        );
      });
    },
    [OrderCancelledEvent]: async (event) => {
      logger.debug('event:', event);
      const { [AGGREGATE_ID]: orderId, payload: { orderDetails: { customerId }}} = event;

      return withTransaction(async (trx) => {

        const customer = await getCustomer(customerId, trx);

        if (!customer) {
          return publishCustomerValidationFailedEvent(orderId, customerId, trx);
        }

        customer.unReserveCredit(orderId);

        return deleteCustomerReservation(orderId, { trx });
      });
    },
  }
};
