const knex = require('./mysql/knex');
const { DomainEventPublisher, DefaultChannelMapping, MessageProducer } = require('eventuate-tram-core-nodejs');

const {
  OrderEntityTypeName,
  OrderCreatedEvent,
  OrderCancelledEvent,
  CustomerEntityTypeName,
  CustomerCreditReservationFailedEvent,
  CustomerValidationFailedEvent,
  CustomerCreditReservedEvent
} = require('../../common/eventsConfig');
const { getCustomerById } = require('../lib/mysql/customerCrudService');
const Customer = require('./aggregates/Customer');
const { insertCustomerReservation, deleteCustomerReservation, getCustomerCreditReservations } = require('./mysql/customerCreditReservationsCrudService');
const { getLogger } = require('../../common/logger');
const logger = getLogger({ title: 'customer-service' });

const channelMapping = new DefaultChannelMapping(new Map());
const messageProducer = new MessageProducer({ channelMapping });
const domainEventPublisher = new DomainEventPublisher({ messageProducer });

function publishCustomerValidationFailedEvent(orderId, customerId) {
  logger.error('Non-existent customer', { orderId, customerId });
  const customerValidationFailedEvent = { orderId, _type: CustomerValidationFailedEvent };
  return domainEventPublisher.publish(CustomerEntityTypeName,
    customerId,
    [ customerValidationFailedEvent ]);
}

module.exports = {
  [OrderEntityTypeName]: {
    [OrderCreatedEvent]: async (event) => {
      logger.debug('event:', event);
      const { partitionId: orderId } = event;

      const trx = await knex.transaction();

      let customerId;
      try {
        const payload = JSON.parse(event.payload);
        const { orderDetails: { orderTotal }} = payload;
        ({ orderDetails: { customerId }} = payload);

        if (typeof (customerId) === 'undefined') {
          return publishCustomerValidationFailedEvent(orderId, String(customerId));
        }

        const possibleCustomer = await getCustomerById(customerId);
        if (!possibleCustomer) {
          return publishCustomerValidationFailedEvent(orderId, customerId);
        }

        const customer = new Customer({ id: customerId, name: possibleCustomer.name, creditLimit: possibleCustomer.amount });
        const reservations = await getCustomerCreditReservations(customer.id);
        customer.initCreditReservations(reservations);
        customer.reserveCredit(orderId, orderTotal);
        await insertCustomerReservation(customer.id, orderTotal.amount, orderId, { trx });

        const customerCreditReservedEvent = { _type: CustomerCreditReservedEvent, orderId: Number(orderId) };
        await domainEventPublisher.publish(CustomerEntityTypeName,
          customerId,
          [ customerCreditReservedEvent ],
          { trx });
        await trx.commit();

      } catch (err) {
        if (err.message === 'CustomerCreditLimitExceededException') {
          const customerCreditReservationFailedEvent = { _type: CustomerCreditReservationFailedEvent, orderId };
          return domainEventPublisher.publish(CustomerEntityTypeName, customerId, [ customerCreditReservationFailedEvent ]);
        }

        await trx.rollback();
        return Promise.reject(err);
      }
    },
    [OrderCancelledEvent]: async (event) => {
      logger.debug('event:', event);
      const { partitionId: orderId } = event;
      try {
        const payload = JSON.parse(event.payload);
        const { orderDetails: { customerId, orderTotal }} = payload;

        const possibleCustomer = await getCustomerById(customerId);
        if (!possibleCustomer) {
          return publishCustomerValidationFailedEvent(orderId, customerId);
        }

        const customer = new Customer({name: possibleCustomer.name, creditLimit: possibleCustomer.amount});
        customer.unReserveCredit(orderId);
        return deleteCustomerReservation(orderId)
      } catch (e) {
        return Promise.reject(e);
      }
    },
  }
};
