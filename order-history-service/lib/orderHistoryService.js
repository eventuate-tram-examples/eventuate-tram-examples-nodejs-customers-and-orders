const { createDocument, findDocument, documentsCount } = require('./mongoDb/mongoDbQueryService');
const CustomerSchema = require('./mongoDb/schema/CustomerSchema');
const OrderSchema = require('./mongoDb/schema/OrderSchema');

module.exports.createCustomer = (customerData) => createDocument(CustomerSchema, customerData);

module.exports.getCustomerById = async (id) => {
  const [ customer ] = await findDocument(CustomerSchema, { id });
  return customer;
};

module.exports.customersCount = async () => documentsCount(CustomerSchema);

module.exports.getOrderById = async (id) => {
  const [ order ] = await findDocument(OrderSchema, { id });
  return order;
};