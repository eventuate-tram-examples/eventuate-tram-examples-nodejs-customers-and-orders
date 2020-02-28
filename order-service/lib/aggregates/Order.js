const { OrderCreatedEvent } = require('../../../common/eventsConfig');
const { updateOrderState } = require('../mysql/orderCrudService');

class Order {
  constructor({ id, orderDetails, state }) {
    this.id = id;
    this.orderDetails = orderDetails;
    this.state = (typeof (state) === 'undefined') ? Order.orderState.PENDING : state;
  }

  static createOrder({ customerId, orderTotal }) {
    return [{ _type: OrderCreatedEvent, orderDetails: { customerId, orderTotal }}]
  }

  cancelOrder(trx) {
    switch (this.state) {
      case Order.orderState.PENDING:
        throw new Error('PendingOrderCantBeCancelledException');
      case Order.orderState.APPROVED:
        this.state = Order.orderState.CANCELLED;
        return updateOrderState(this.id, this.state, { trx });
      default:
        throw new Error(`Can't cancel in this state ${this.state}`);
    }
  }

  noteCreditReserved(trx) {
    this.state = Order.orderState.APPROVED;
    return updateOrderState(this.id, this.state, { trx })
  }

  noteCreditReservationFailed(trx) {
    this.state = Order.orderState.REJECTED;
    return updateOrderState(this.id, this.state, { trx })
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
