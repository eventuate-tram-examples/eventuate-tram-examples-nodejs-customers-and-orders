const knex = require('./knex');

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
  withTransaction,
};