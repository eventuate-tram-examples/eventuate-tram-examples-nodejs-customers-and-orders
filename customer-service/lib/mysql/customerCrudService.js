const knex = require('./knex');
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

async function getCustomerById(id) {
  const [ customer ] = await knex(CUSTOMER_TABLE).where('id', id);
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

async function withTransaction(callback) {
  const trx = await knex.transaction();
  try {
    const result = await callback(trx);
    await trx.commit();
    return result;
  } catch (e) {
    await trx.rollback();
    throw e;
  }
}

module.exports = {
  insertIntoCustomerTable,
  getCustomerById,
  createCustomerTable,
  withTransaction,
};
