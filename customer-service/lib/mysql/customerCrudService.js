const knex = require('./knex');
const { getLogger } = require('../../../common/logger');

const logger = getLogger({ title: 'customerCrudService' });
const CUSTOMER_TABLE = 'customer';

function insertIntoCustomerTable (name, amount, creation_time) {
  const customer = { name, amount, creation_time };
  return knex(CUSTOMER_TABLE).insert(customer).returning('*');
}

module.exports = {
  insertIntoCustomerTable
};