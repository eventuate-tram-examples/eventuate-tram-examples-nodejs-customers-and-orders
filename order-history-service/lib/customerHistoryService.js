const { createDocument } = require('./mongoDb/mongoDbQueryService');
const CustomerSchema = require('./mongoDb/schema/CustomerSchema');

module.exports.createCustomer = (customerData) => {
  return createDocument(CustomerSchema, customerData);
};