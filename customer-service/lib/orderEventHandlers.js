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
const { DomainEventPublisher, DefaultChannelMapping, MessageProducer } = require('eventuate-tram-core-nodejs');
const Customer = require('./aggregates/Customer');

const channelMapping = new DefaultChannelMapping(new Map());
const messageProducer = new MessageProducer({ channelMapping });
const domainEventPublisher = new DomainEventPublisher({ messageProducer });

module.exports = {
  [OrderEntityTypeName]: {
    [OrderCreatedEvent]: async (event) => {
      console.log('event:', event);
      const { partitionId: orderId } = event;
      try {
        const payload = JSON.parse(event.payload);
        const { orderDetails: { customerId, orderTotal }} = payload;

        const possibleCustomer = await getCustomerById(customerId);
        if (!possibleCustomer) {
          logger.info('Non-existent customer;', customerId);
          const customerValidationFailedEvent = { orderId, _type: CustomerValidationFailedEvent };
          return domainEventPublisher.publish(CustomerEntityTypeName,
            customerId,
            [ customerValidationFailedEvent ]);
        }

        const customer = new Customer({ name: possibleCustomer.name, creditLimit: possibleCustomer.amount });

        try {
          customer.reserveCredit(orderId, orderTotal);

          const customerCreditReservedEvent = { _type: CustomerCreditReservedEvent, orderId };
          return domainEventPublisher.publish(CustomerEntityTypeName,
            customerId,
            [ customerCreditReservedEvent ]);

        } catch (err) {

          if (err.message === 'CustomerCreditLimitExceededException') {
            const customerCreditReservationFailedEvent = { _type: CustomerCreditReservationFailedEvent, orderId };
            domainEventPublisher.publish(CustomerEntityTypeName, customerId, [ customerCreditReservationFailedEvent ]);
          }

          return Promise.reject(err);
        }
      } catch (e) {
        return Promise.reject(e);
      }
    },
    [OrderCancelledEvent]: async (event) => {
      console.log('event:', event);
      const { partitionId: orderId } = event;
      try {
        const payload = JSON.parse(event.payload);
        const {orderDetails: {customerId, orderTotal}} = payload;

        const possibleCustomer = await getCustomerById(customerId);
        if (!possibleCustomer) {
          logger.info('Non-existent customer;', customerId);
          const customerValidationFailedEvent = {orderId, _type: CustomerValidationFailedEvent};
          return domainEventPublisher.publish(CustomerEntityTypeName,
            customerId,
            [customerValidationFailedEvent]);
        }

        const customer = new Customer({name: possibleCustomer.name, creditLimit: possibleCustomer.amount});
        customer.unreserveCredit(orderId);

        return Promise.resolve();
      } catch (e) {
        return Promise.reject(e);
      }
    },
  }
};