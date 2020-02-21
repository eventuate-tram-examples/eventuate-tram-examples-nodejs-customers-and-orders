const knex = require('./knex');
const { getLogger } = require('../../../common/logger');

const logger = getLogger({ title: 'customer-service' });
const CUSTOMER_TABLE = 'customer';
const CUSTOMER_CREDIT_RESERVATIONS_TABLE = 'customer_credit_reservations';

function insertIntoCustomerTable (name, amount, creation_time, context = {}) {
  const { trx } = context;
  const customer = { name, amount, creation_time };

  if (trx) {
    return knex(CUSTOMER_TABLE).transacting(trx).insert(customer);
  }

  return knex(CUSTOMER_TABLE).insert(customer).returning('*');
}

async function getCustomerById(id) {
  const [ message ] = await knex(CUSTOMER_TABLE).where('id', id);
  return message;
}

function createCustomerTable() {
  return knex.schema.createTable(CUSTOMER_TABLE, (table) => {
    table.bigIncrements('id');
    table.string('name');
    table.bigInteger('creation_time');
    table.decimal('amount', 19, 2);
  })
}


function createCustomerCreditReservationsTable() {
  return knex.schema.createTable(CUSTOMER_CREDIT_RESERVATIONS_TABLE, (table) => {
    table.bigInteger('customer_id');
    table.bigInteger('credit_reservations_key');
    table.decimal('amount', 19, 2);
    table.primary(['customer_id', 'credit_reservations_key'])
  })
}

module.exports = {
  insertIntoCustomerTable,
  getCustomerById,
  createCustomerTable,
  createCustomerCreditReservationsTable,
};