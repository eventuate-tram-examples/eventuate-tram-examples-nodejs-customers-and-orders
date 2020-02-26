const { OrderCreatedEvent } = require('../../../common/eventsConfig');

class Order {
  constructor({ customerId, orderTotal, state }) {
    this.customerId = customerId;
    this.orderTotal = orderTotal;
    this.state = (typeof (state) === 'undefined') ? Order.OrderState.PENDING : state;
  }

  static create({ customerId, orderTotal }) {
    return [{ _type: OrderCreatedEvent, orderDetails: { customerId, orderTotal }}]
  }

  static OrderState = {
    PENDING: 0,
    APPROVED: 1,
    REJECTED: 2,
    CANCEL_PENDING: 3,
    CANCELLED: 4
  };
}

module.exports = Order;