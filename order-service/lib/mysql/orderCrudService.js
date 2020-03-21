const knex = require('common-module/mysql-lib/knex');
const { getLogger } = require('common-module/logger');

const logger = getLogger({ title: 'order-service' });
const ORDER_TABLE = 'orders';

function insertIntoOrdersTable (customer_id, amount, state, context = {}) {
  const { trx } = context;
  const order = { customer_id, amount, state };

  if (trx) {
    return knex(ORDER_TABLE).transacting(trx).insert(order);
  }

  return knex(ORDER_TABLE).insert(order).returning('*');
}

async function getOrderById(id, context= {} ) {
  const { trx } = context;
  let order;
  if (trx) {
    ([ order ] = await knex(ORDER_TABLE).transacting(trx).where('id', id));
  } else {
    ([ order ] = await knex(ORDER_TABLE).where('id', id));
  }

  return order;
}

function createOrdersTable() {
  return knex.schema.createTable(ORDER_TABLE, (table) => {
    table.bigIncrements('id');
    table.bigInteger('customer_id');
    table.decimal('amount', 19, 2);
    table.integer('state');
  })
}

function updateOrderState(id, state, context = {}) {
  const { trx } = context;

  if (trx) {
    return knex(ORDER_TABLE)
      .transacting(trx)
      .where('id', id)
      .update({ state });
  }

  return knex(ORDER_TABLE)
    .where('id', id)
    .update({ state });
}

module.exports = {
  insertIntoOrdersTable,
  getOrderById,
  createOrdersTable,
  updateOrderState,
};