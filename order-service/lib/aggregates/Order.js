const { OrderCreatedEvent } = require('../../../common/eventsConfig');

class Order {
  constructor({ id, orderDetails, state }) {
    this.id = id;
    this.orderDetails = orderDetails;
    this.state = (typeof (state) === 'undefined') ? Order.orderState.PENDING : state;
  }

  static createOrder({ customerId, orderTotal }) {
    return [{ _type: OrderCreatedEvent, orderDetails: { customerId, orderTotal }}]
  }

  cancelOrder() {
    switch (this.state) {
      case Order.orderState.PENDING:
        throw new Error('PendingOrderCantBeCancelledException');
      case Order.orderState.APPROVED:
        this.state = Order.orderState.CANCELLED;
        break;
      default:
        throw new Error(`Can't cancel in this state ${this.state}`);
    }
  }

  noteCreditReserved() {
    this.state = Order.orderState.APPROVED;
  }

  noteCreditReservationFailed() {
    this.state = Order.orderState.REJECTED;
  }

  static orderState = {
    PENDING: 0,
    APPROVED: 1,
    REJECTED: 2,
    CANCEL_PENDING: 3,
    CANCELLED: 4
  };

  static getOrderStateText(state) {
    return Object.keys(Order.orderState)[state];
  }
}

module.exports = Order;
