const { DomainEventPublisher, DefaultChannelMapping, MessageProducer } = require('eventuate-tram-core-nodejs');
const Order = require('./aggregates/Order');
const { OrderEntityTypeName, OrderCancelledEvent, OrderApprovedEvent, OrderRejectedEvent } = require('../../common/eventsConfig');
const { insertIntoOrdersTable, getOrderById } = require('./mysql/orderCrudService');
const knex = require('./mysql/knex');

const channelMapping = new DefaultChannelMapping(new Map());
const messageProducer = new MessageProducer({ channelMapping });
const domainEventPublisher = new DomainEventPublisher({ messageProducer });

async function getOrderEntity(id) {
  const orderData = await getOrderById(id);
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
  const trx = await knex.transaction();
  try {
    const state = Order.orderState.PENDING;
    const [ aggregateId ] = await insertIntoOrdersTable(customerId, orderTotal.amount, state, { trx });
    const events = Order.createOrder({ customerId, orderTotal });
    await domainEventPublisher.publish(OrderEntityTypeName, aggregateId, events, { trx });
    await trx.commit();
    return aggregateId;
  } catch (e) {
    await trx.rollback();
    throw e;
  }
};

module.exports.cancelOrder = async (orderId) => {
  const trx = await knex.transaction();
  const order = await getOrderEntity(orderId);

  try {
    await order.cancelOrder(trx);
    await domainEventPublisher.publish(
      OrderEntityTypeName,
      orderId,
      [ { _type: OrderCancelledEvent, orderDetails: order.orderDetails } ],
      { trx }
    );

    await trx.commit();
    return {
      id: order.id,
      orderDetails: order.orderDetails,
      state: order.state,
    };
  } catch (e) {
    await trx.rollback();
    throw e;
  }
};

module.exports.getOrderById = async (orderId) => {
  return getOrderById(orderId);
};

module.exports.approveOrder = async (orderId) => {
  const trx = await knex.transaction();
  const order = await getOrderEntity(orderId);

  try {
    await order.noteCreditReserved(trx);
    await domainEventPublisher.publish(
      OrderEntityTypeName,
      orderId,
      [ { _type: OrderApprovedEvent, orderDetails: order.orderDetails } ],
      { trx }
    );
    await trx.commit();
  } catch (e) {
    await trx.rollback();
    throw e;
  }
};

module.exports.rejectOrder = async (orderId) => {
  const trx = await knex.transaction();
  const order = await getOrderEntity(orderId);

  order.noteCreditReservationFailed();
  await domainEventPublisher.publish(
    OrderEntityTypeName,
    orderId,
    [ { _type: OrderRejectedEvent, ...order.orderDetails } ],
    { trx }
  );
  await trx.commit();
};
