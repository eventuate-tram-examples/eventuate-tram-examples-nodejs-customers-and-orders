const { DomainEventPublisher, DefaultChannelMapping, MessageProducer } = require('eventuate-tram-core-nodejs');
const Customer = require('./aggregates/Customer');
const { CustomerEntityTypeName } = require('common-module/eventsConfig');
const { withTransaction } = require('common-module/mysql-lib/utils');
const { insertIntoCustomerTable, getCustomerById } = require('./mysql/customerCrudService');
const { getCustomerCreditReservations } = require('./mysql/customerCreditReservationsCrudService');

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

module.exports.getCustomer = async (customerId, trx) => {
  const customerData = await getCustomerById(customerId, { trx });
  if (!customerData) {
    return null;
  }

  const reservations = await getCustomerCreditReservations(customerId, { trx });

  const creditReservations = reservations.reduce((acc, r) => {
    acc[r.order_id] = r.amount;
    return acc;
  }, {});

  return new Customer({
    id: customerId,
    name: customerData.name,
    creditLimit: customerData.amount,
    creditReservations
  });
};