const { CustomerCreatedEvent, CustomerEntityTypeName } = require('../../../common/eventsConfig');
const { EVENT_TYPE, AGGREGATE_TYPE, EVENT_DATA } = require('eventuate-tram-core-nodejs/lib/eventMessageHeaders');

class Customer {
  constructor({ name, creditLimit }) {
    this.name = name;
    this.creditLimit = creditLimit;
  }

  static create(name, creditLimit) {
    const customer = new Customer({ name, creditLimit });

    return {
      customer,
      events: [
        {
          [EVENT_TYPE]: CustomerCreatedEvent,
          [AGGREGATE_TYPE]: CustomerEntityTypeName,
          [EVENT_DATA]: customer
        }
      ]
    }
  }
}

module.exports = Customer;