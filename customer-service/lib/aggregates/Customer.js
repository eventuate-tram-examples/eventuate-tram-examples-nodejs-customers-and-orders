const { CustomerCreatedEvent } = require('../../../common/eventsConfig');

class Customer {
  constructor({ id, name, creditLimit }) {
    this.id = id;
    this.name = name;
    this.creditLimit = creditLimit;
    this.creditReservations = {};
    this.creationTime = new Date().getTime();
  }

  static create({ name, creditLimit }) {
    return [{ _type: CustomerCreatedEvent, name, creditLimit }]
  }

  initCreditReservations(reservations) {
    reservations.forEach((r) => {
      this.creditReservations[r.order_id] = r.amount;
    });
  }

  availableCredit() {
    const reservationsSum = Object.values(this.creditReservations).reduce((acc, amount) => acc + amount, 0);
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