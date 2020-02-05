const DomainEventPublisher = require('eventuate-tram-core-nodejs/lib/DomainEventPublisher');
const DefaultChannelMapping = require('eventuate-tram-core-nodejs/lib/DefaultChannelMapping');
const MessageProducer = require('eventuate-tram-core-nodejs/lib/MessageProducer');
const Customer = require('./aggregates/Customer');
const { CustomerEntityTypeName } = require('../../common/eventsConfig');
const { insertIntoCustomerTable } = require('./mysql/customerCrudService');

const channelMapping = new DefaultChannelMapping(new Map());
const messageProducer = new MessageProducer({ channelMapping });
const domainEventPublisher = new DomainEventPublisher({ messageProducer });

module.exports.create = async ({ name, creditLimit }) => {

  const [ aggregateId ] = await insertIntoCustomerTable(name, creditLimit.amount);

  const customerAndEvents = Customer.create({ name, creditLimit });
  const aggregateType = CustomerEntityTypeName;
  const extraHeaders = [];
  return domainEventPublisher.publish(aggregateType, aggregateId, extraHeaders, customerAndEvents.events);
};