const { DomainEventPublisher, DefaultChannelMapping, MessageProducer } = require('eventuate-tram-core-nodejs');
const Order = require('./aggregates/Order');
const { OrderEntityTypeName, OrderCancelledEvent, OrderApprovedEvent, OrderRejectedEvent } = require('../../common/eventsConfig');
const { insertIntoOrdersTable, getOrderById, updateOrderState } = require('./mysql/orderCrudService');
const knex = require('../../common/mysql/knex');
const { withTransaction } = require('../../common/mysql/utils');

const channelMapping = new DefaultChannelMapping(new Map());
const messageProducer = new MessageProducer({ channelMapping });
const domainEventPublisher = new DomainEventPublisher({ messageProducer });

async function getOrderEntity(id, trx) {
  const orderData = await getOrderById(id, { trx });
  if (!orderData) {
    throw new Error('OrderNotExistsException')
  }

  return new Order({
    id: orderData.id,
    orderDetails: {
      customerId: orderData.customer_id,
      orderTotal: {
        amount: orderData.amount,
      }
    },
    state: orderData.state,
  });
}

module.exports.create = async ({ customerId, orderTotal }) => {
  return withTransaction(async (trx) => {
    const state = Order.orderState.PENDING;
    const [ aggregateId ] = await insertIntoOrdersTable(customerId, orderTotal.amount, state, { trx });
    const events = Order.createOrder({ customerId, orderTotal });
    await domainEventPublisher.publish(OrderEntityTypeName, aggregateId, events, { trx });
    return aggregateId;
  });
};

module.exports.cancelOrder = async (orderId) => {
  return withTransaction(async (trx) => {
    const order = await getOrderEntity(orderId, trx);
    order.cancelOrder();
    await updateOrderState(order.id, order.state, { trx });
    await domainEventPublisher.publish(
      OrderEntityTypeName,
      orderId,
      [ { _type: OrderCancelledEvent, orderDetails: order.orderDetails } ],
      { trx }
    );

    return {
      id: order.id,
      orderDetails: order.orderDetails,
      state: order.state,
    };
  });
};

module.exports.getOrderById = async (orderId) => {
  return getOrderById(orderId);
};

module.exports.approveOrder = async (orderId) => {
  return withTransaction(async (trx) => {
    const order = await getOrderEntity(orderId, trx);

    order.noteCreditReserved();
    await updateOrderState(order.id, order.state, { trx });
    return domainEventPublisher.publish(
      OrderEntityTypeName,
      orderId,
      [ { _type: OrderApprovedEvent, orderDetails: order.orderDetails } ],
      { trx }
    );
  });
};

module.exports.rejectOrder = async (orderId) => {
  return withTransaction(async (trx) => {
    const order = await getOrderEntity(orderId, trx);

    order.noteCreditReservationFailed();
    await updateOrderState(order.id, order.state, { trx });
    return domainEventPublisher.publish(
      OrderEntityTypeName,
      orderId,
      [ { _type: OrderRejectedEvent, orderDetails: order.orderDetails } ],
      { trx }
    );
  });
};
