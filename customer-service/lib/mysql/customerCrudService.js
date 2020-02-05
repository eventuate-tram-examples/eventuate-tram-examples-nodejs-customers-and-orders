const knex = require('./knex');
const { getLogger } = require('../../../common/logger');

const logger = getLogger({ title: 'customerCrudService' });
const CUSTOMER_TABLE = 'customer';

function insertIntoCustomerTable (name, amount) {
  const customer = { name, amount };
  return knex(CUSTOMER_TABLE).insert(customer).returning('*');
}

module.exports = {
  insertIntoCustomerTable
};