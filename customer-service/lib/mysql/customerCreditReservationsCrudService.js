const knex = require('common-module/mysql-lib/knex');
const { getLogger } = require('common-module/logger');

const logger = getLogger({ title: 'customer-service' });
const CUSTOMER_CREDIT_RESERVATIONS_TABLE = 'customer_credit_reservations';

function createCustomerCreditReservationsTable() {
  return knex.schema.createTable(CUSTOMER_CREDIT_RESERVATIONS_TABLE, (table) => {
    table.bigInteger('customer_id');
    table.bigInteger('credit_reservations_key');
    table.decimal('amount', 19, 2);
    table.primary(['customer_id', 'credit_reservations_key'])
  })
}

function getCustomerCreditReservations(customerId, context = {}) {
  const { trx } = context;
  if (trx) {
    return knex(CUSTOMER_CREDIT_RESERVATIONS_TABLE).transacting(trx).where('customer_id', customerId);
  }
  return knex(CUSTOMER_CREDIT_RESERVATIONS_TABLE).where('customer_id', customerId);
}

function insertCustomerReservation(customer_id, amount, credit_reservations_key, context = {}) {
  const { trx } = context;
  const customerReservation = {
    customer_id,
    amount,
    credit_reservations_key,
  };

  if (trx) {
    return knex(CUSTOMER_CREDIT_RESERVATIONS_TABLE).transacting(trx).insert(customerReservation);
  }

  return knex(CUSTOMER_CREDIT_RESERVATIONS_TABLE).insert(customerReservation);
}

function deleteCustomerReservation(order_id, context = {}) {
  const { trx } = context;

  if (trx) {
    return knex(CUSTOMER_CREDIT_RESERVATIONS_TABLE)
      .transacting(trx)
      .where('credit_reservations_key', order_id)
      .del();
  }

  return knex(CUSTOMER_CREDIT_RESERVATIONS_TABLE)
    .where('credit_reservations_key', order_id)
    .del();
}


module.exports = {
  createCustomerCreditReservationsTable,
  insertCustomerReservation,
  deleteCustomerReservation,
  getCustomerCreditReservations,
};