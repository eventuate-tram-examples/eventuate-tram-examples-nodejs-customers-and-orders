const { upsertDocument, findDocument, documentsCount, updateDocument } = require('./mongoDb/mongoDbQueryService');
const CustomerSchema = require('./mongoDb/schema/CustomerSchema');
const OrderSchema = require('./mongoDb/schema/OrderSchema');

const createOrUpdateCustomer = (customerData) => upsertDocument(CustomerSchema, customerData, { id: customerData.id });

module.exports.addCustomerOrder = ({ orderId, state, orderTotal }) => {
  return updateDocument(OrderSchema, { orders: { [orderId]: { orderId, state, orderTotal } } });
};

module.exports.getCustomerById = async (id) => {
  const [ customer ] = await findDocument(CustomerSchema, { id });
  return customer;
};

module.exports.customersCount = async () => documentsCount(CustomerSchema);

module.exports.getOrderById = async (id) => {
  const [ order ] = await findDocument(OrderSchema, { id });
  return order;
};

const createOrUpdateOrder = (orderData) => upsertDocument(OrderSchema, orderData, { id: orderData.id });

module.exports.updateCustomerAndOrderViewState = async ({ orderId, customerId, state, orderTotal }) => {
  orderId = Number(orderId);
  customerId = Number(customerId);
  await createOrUpdateOrder({ id: orderId, customerId, orderTotal, state });
  const orderKey = `orders.${orderId}`;
  return createOrUpdateCustomer({
    id: customerId,
    [orderKey]: {
      orderId,
      state,
      orderTotal
    },
  });
};

module.exports.createOrUpdateCustomer = createOrUpdateCustomer;
module.exports.createOrUpdateOrder = createOrUpdateOrder;
