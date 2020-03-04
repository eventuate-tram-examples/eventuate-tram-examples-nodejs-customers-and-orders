const { DomainEventPublisher, DefaultChannelMapping, MessageProducer } = require('eventuate-tram-core-nodejs');
const Customer = require('./aggregates/Customer');
const { CustomerEntityTypeName } = require('../../common/eventsConfig');
const { insertIntoCustomerTable, withTransaction } = require('./mysql/customerCrudService');

const channelMapping = new DefaultChannelMapping(new Map());
const messageProducer = new MessageProducer({ channelMapping });
const domainEventPublisher = new DomainEventPublisher({ messageProducer });

module.exports.create = async ({ name, creditLimit }) => {
  const creationTime = new Date().getTime();

  return withTransaction(async (trx) => {
    const [ aggregateId ] = await insertIntoCustomerTable(name, creditLimit.amount, creationTime, { trx });
    const events = Customer.create({ name, creditLimit });
    await domainEventPublisher.publish(CustomerEntityTypeName, aggregateId, events, { trx });
    return aggregateId;
  });
};