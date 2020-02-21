const { CustomerCreatedEvent, CustomerEntityTypeName } = require('../../../common/eventsConfig');
const { EVENT_TYPE, AGGREGATE_TYPE, EVENT_DATA } = require('eventuate-tram-core-nodejs/lib/eventMessageHeaders');

class Customer {
  constructor({ name, creditLimit }) {
    this.name = name;
    this.creditLimit = creditLimit;
    this.creditReservations = {};
    this.creationTime = new Date().getTime();
  }

  static create({ name, creditLimit }) {
    return [{ _type: CustomerCreatedEvent, name, creditLimit }]
  }

  availableCredit() {
    const reservationsSum = Object.values(this.creditReservations).reduce((acc, r ) => {
      acc += r;
      return acc;
    }, 0);
    return this.creditLimit - reservationsSum;
  }

  reserveCredit(orderId, orderTotal) {
    const { amount } = orderTotal;
    if (this.availableCredit() >= amount) {
      this.creditReservations[orderId] = amount;
    } else {
      throw new Error('CustomerCreditLimitExceededException');
    }
  }

  unReserveCredit(orderId) {
    delete this.creditReservations[orderId];
  }
}

module.exports = Customer;