const { DomainEventPublisher, DefaultChannelMapping, MessageProducer } = require('eventuate-tram-core-nodejs');
const Order = require('./aggregates/Order');
const { OrderEntityTypeName } = require('../../common/eventsConfig');
const { insertIntoOrdersTable, getOrderById } = require('./mysql/orderCrudService');
const knex = require('./mysql/knex');

const channelMapping = new DefaultChannelMapping(new Map());
const messageProducer = new MessageProducer({ channelMapping });
const domainEventPublisher = new DomainEventPublisher({ messageProducer });

module.exports.create = async ({ customerId, orderTotal }) => {
  const trx = await knex.transaction();
  try {
    const state = Order.OrderState.PENDING;
    const [ aggregateId ] = await insertIntoOrdersTable(customerId, orderTotal.amount, state, { trx });
    const events = Order.create({ customerId, orderTotal });
    await domainEventPublisher.publish(OrderEntityTypeName, aggregateId, events, { trx });
    await trx.commit();
    return aggregateId;
  } catch (e) {
    await trx.rollback()
  }
};

module.exports.getOrderById = async (orderId) => {
  return getOrderById(orderId);
};
