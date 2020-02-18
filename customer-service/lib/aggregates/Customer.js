const { CustomerCreatedEvent, CustomerEntityTypeName } = require('../../../common/eventsConfig');
const { EVENT_TYPE, AGGREGATE_TYPE, EVENT_DATA } = require('eventuate-tram-core-nodejs/lib/eventMessageHeaders');

class Customer {
  constructor({ name, creditLimit }) {
    this.name = name;
    this.creditLimit = creditLimit;
    this.creditReservations = [];
    this.creationTime = new Date().getTime();
  }

  static create(name, creditLimit) {
    const customer = new Customer({ name, creditLimit });

    return {
      customer,
      events: [
        {
          _type: CustomerCreatedEvent,
          name: customer.name,
          creditLimit: customer.creditLimit
        }
      ]
    }
  }

  availableCredit() {
    const reservationsSum = Object.values(this.creditReservations).reduce((acc, r ) => {
      acc += r;
      return acc;
    }, 0);
    return this.creditLimit - reservationsSum;
  }

  reserveCredit(orderId, orderTotal) {
    if (this.availableCredit() >= orderTotal) {
      this.creditReservations[orderId] = orderTotal;
    } else {
      throw new Error('CustomerCreditLimitExceededException');
    }
  }

  unreserveCredit(orderId) {
    delete this.creditReservations[orderId];
  }
}

module.exports = Customer;