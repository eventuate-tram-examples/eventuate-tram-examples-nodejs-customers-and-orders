const DomainEventPublisher = require('eventuate-tram-core-nodejs/lib/DomainEventPublisher');
const DefaultChannelMapping = require('eventuate-tram-core-nodejs/lib/DefaultChannelMapping');
const MessageProducer = require('eventuate-tram-core-nodejs/lib/MessageProducer');
const Customer = require('./aggregates/Customer');
const { CustomerEntityTypeName } = require('../../common/eventsConfig');
const { insertIntoCustomerTable } = require('./mysql/customerCrudService');
const knex = require('./mysql/knex');

const channelMapping = new DefaultChannelMapping(new Map());
const messageProducer = new MessageProducer({ channelMapping });
const domainEventPublisher = new DomainEventPublisher({ messageProducer });

module.exports.create = async ({ name, creditLimit }) => {
  const creationTime = new Date().getTime();
  const trx = await knex.transaction();
  try {
    const [ aggregateId ] = await insertIntoCustomerTable(name, creditLimit.amount, creationTime, { trx });

    const customerAndEvents = Customer.create({ name, creditLimit });
    const aggregateType = CustomerEntityTypeName;
    const extraHeaders = [];
    await domainEventPublisher.publish(aggregateType, aggregateId, extraHeaders, customerAndEvents.events);
    await trx.commit();
    return aggregateId;
  } catch (e) {
    await trx.rollback()
  }
};