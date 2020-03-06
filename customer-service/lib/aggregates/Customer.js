const { CustomerCreatedEvent } = require('../../../common/eventsConfig');

class Customer {
  constructor({ id, name, creditLimit, creditReservations }) {
    this.id = id;
    this.name = name;
    this.creditLimit = creditLimit;
    this.creditReservations = creditReservations
  }

  static create({ name, creditLimit }) {
    return [{ _type: CustomerCreatedEvent, name, creditLimit }]
  }

  availableCredit() {
    const reservationsSum = Object.values(this.creditReservations).reduce((acc, amount) => acc + amount, 0);
    return this.creditLimit - reservationsSum;
  }

  reserveCredit(orderId, amount) {
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