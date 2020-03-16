const { createCustomer, createOrder, assertOrderState, cancelOrder, getCustomerView, expectOrderState } = require('./lib/helpers');

const timeout = 20000;
const nonExistentCustomerId = 123;

describe('CustomersAndOrders', function () {
  this.timeout(timeout);

  it('should cancel', async function () {
    const customerId = await createCustomer({ name: 'Fred', amount: 15.00 });
    const orderId = await createOrder({ customerId, amount: 12.34 });
    await assertOrderState({ orderId, state: 'APPROVED' });
    await cancelOrder(orderId);
    await assertOrderState({ orderId, state: 'CANCELLED' });
    const customerView = await getCustomerView(customerId);
    expectOrderState({ orderId, state: 'CANCELLED', orders: customerView.orders });
  });

  it('should reject', async function () {
    const customerId = await createCustomer({ name: 'Fred', amount: 15.00 });
    const orderId = await createOrder({ customerId, amount: 123.34 });
    await assertOrderState({ orderId, state: 'REJECTED' });
  });

  it('should reject for non existent customer ID', async function () {
    const orderId = await createOrder({ customerId: nonExistentCustomerId, amount: 123.34 });
    await assertOrderState({ orderId, state: 'REJECTED' });
  });

  it('should approve', async function () {
    const customerId = await createCustomer({ name: 'Fred', amount: 15.00 });
    const orderId = await createOrder({ customerId, amount: 12.34 });
    await assertOrderState({ orderId, state: 'APPROVED' });
  });

  it('should reject, approve and keep orders in history', async function () {
    const customerId = await createCustomer({ name: 'John', amount: 1000 });
    const orderId = await createOrder({ customerId, amount: 100 });
    await assertOrderState({ orderId, state: 'APPROVED' });

    const orderId2 = await createOrder({ customerId, amount: 1000 });
    await assertOrderState({ orderId: orderId2, state: 'REJECTED' });

    const customerView = await getCustomerView(customerId);
    expectOrderState({ orderId, state: 'APPROVED', orders: customerView.orders });
    expectOrderState({ orderId: orderId2, state: 'REJECTED', orders: customerView.orders });
  });
});