const knex = require('./knex');
const { getLogger } = require('../../../common/logger');

const logger = getLogger({ title: 'customerCrudService' });
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
  const [ message ] = await knex(CUSTOMER_TABLE).where('id', id);
  return message;
}

module.exports = {
  insertIntoCustomerTable,
  getCustomerById
};