const knex = require('../../../common/mysql/knex');
const { getLogger } = require('../../../common/logger');

const logger = getLogger({ title: 'customer-service' });
const CUSTOMER_TABLE = 'customer';

function insertIntoCustomerTable (name, amount, creation_time, context = {}) {
  const { trx } = context;
  const customer = { name, amount, creation_time };

  if (trx) {
    return knex(CUSTOMER_TABLE).transacting(trx).insert(customer);
  }

  return knex(CUSTOMER_TABLE).insert(customer).returning('*');
}

async function getCustomerById(id, context = {}) {
  const { trx } = context;
  let customer;
  if (trx) {
    ([ customer ] = await knex(CUSTOMER_TABLE).transacting(trx).where('id', id));
  } else {
    ([ customer ] = await knex(CUSTOMER_TABLE).where('id', id));
  }
  return customer;
}

function createCustomerTable() {
  return knex.schema.createTable(CUSTOMER_TABLE, (table) => {
    table.bigIncrements('id');
    table.string('name');
    table.bigInteger('creation_time');
    table.decimal('amount', 19, 2);
  })
}

module.exports = {
  insertIntoCustomerTable,
  getCustomerById,
  createCustomerTable,
};
