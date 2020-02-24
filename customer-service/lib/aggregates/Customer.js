const { CustomerCreatedEvent, CustomerEntityTypeName } = require('../../../common/eventsConfig');
const { EVENT_TYPE, AGGREGATE_TYPE, EVENT_DATA } = require('eventuate-tram-core-nodejs/lib/eventMessageHeaders');
const { insertCustomerReservation, deleteCustomerReservation, getCustomerCreditReservations } = require('../mysql/customerCreditReservationsCrudService');

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

  async loadReservations() {
    const reservations = await getCustomerCreditReservations(this.id);
    reservations.forEach((r) => {
      this.creditReservations[r.order_id] = r.amount;
    });
  }

  async availableCredit() {
    await this.loadReservations();
    const reservationsSum = Object.values(this.creditReservations).reduce((acc, amount) => acc + amount, 0);
    return this.creditLimit - reservationsSum;
  }

  async reserveCredit(orderId, orderTotal, tnx) {
    const { amount } = orderTotal;
    if (await this.availableCredit(tnx) >= amount) {
      this.creditReservations[orderId] = amount;
      await insertCustomerReservation(this.id, amount, orderId, { tnx });
    } else {
      throw new Error('CustomerCreditLimitExceededException');
    }
  }

  unReserveCredit(orderId) {
    delete this.creditReservations[orderId];
    return deleteCustomerReservation(orderId)
  }
}

module.exports = Customer;