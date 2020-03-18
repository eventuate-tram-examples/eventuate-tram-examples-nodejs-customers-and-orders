const chai = require('chai');
const { expect } = chai;
const chaiHttp = require('chai-http');
chai.use(chaiHttp);
const retry = require('retry-assert');

const host = process.env.DOCKER_HOST_IP;
const ports = {
  customer_service: 8082,
  order_service: 8081,
  order_history_service: 8083,
};

function getServiceUrl(service) {
  return `http://${host}:${ports[service]}`;
}

function delay(time) {
  return new Promise((resolve) => {
    setTimeout(function () {
      resolve();
    }, time)
  })
}

module.exports.createCustomer = async ({ name, amount }) => {
  const res = await chai.request(getServiceUrl('customer_service')).post('/customers').send({ name, creditLimit: { amount } });
  expect(res).to.have.status(200);
  const body = res.body;
  expect(body).to.be.an('Object');
  expect(body).to.haveOwnProperty('customerId');
  expect(body.customerId).to.be.a('Number');
  return body.customerId;
};

module.exports.createOrder = async ({ customerId, amount }) => {
  const res = await chai.request(getServiceUrl('order_service')).post('/orders').send({ customerId, orderTotal: { amount } });
  expect(res).to.have.status(200);
  const body = res.body;
  expect(body).to.be.an('Object');
  expect(body).to.haveOwnProperty('orderId');
  expect(body.orderId).to.be.a('Number');
  return body.orderId;
};

async function getOrder(id) {
  const res = await chai.request(getServiceUrl('order_service')).get(`/orders/${id}`);
  expect(res).to.have.status(200);
  const body = res.body;
  expect(body).to.be.an('Object');
  expect(body).to.haveOwnProperty('orderId');
  expect(body.orderId).to.be.a('Number');
  expect(body).to.haveOwnProperty('orderState');
  expect(body.orderState).to.be.a('String');
  return body;
}

module.exports.cancelOrder = async (orderId) => {
  const res = await chai.request(getServiceUrl('order_service')).post(`/orders/${orderId}/cancel`);
  expect(res).to.have.status(200);
  const body = res.body;
  expect(body).to.be.an('Object');
  expect(body).to.haveOwnProperty('orderId');
  expect(body.orderId).to.be.a('Number');
  expect(body).to.haveOwnProperty('orderState');
  expect(body.orderState).to.be.a('String');
  expect(body.orderState).eq('CANCELLED');
  return body;
};

module.exports.assertOrderState = async ({ orderId, state }) => {
  return retry()
    .fn(() => getOrder(orderId))
    .until(order => expect(order.orderState).eq(state));
};

module.exports.getCustomerView = async (customerId) => {
  const res = await chai.request(getServiceUrl('order_history_service')).get(`/customers/${customerId}`);
  expect(res).to.have.status(200);
  const body = res.body;
  expect(body).to.be.an('Object');
  expect(body).to.haveOwnProperty('id');
  expect(body.id).to.be.a('Number');
  expect(body).to.haveOwnProperty('name');
  expect(body.name).to.be.a('String');
  expect(body).to.haveOwnProperty('creditLimit');
  expect(body.creditLimit).to.be.an('Object');
  expect(body.creditLimit).to.haveOwnProperty('amount');
  expect(body.creditLimit.amount).to.be.a('Number');
  expect(body.orders).to.be.an('Object');
  Object.values(body.orders).forEach(expectOrder);
  return body;
};

function expectOrder(order) {
  expect(order).to.be.an('Object');
  expect(order).to.haveOwnProperty('orderId');
  expect(order.orderId).to.be.a('Number');
  expect(order).to.haveOwnProperty('state');
  expect(order.state).to.be.a('String');
  expect(order).to.haveOwnProperty('orderTotal');
  expect(order.orderTotal).to.be.an('Object');
  expect(order.orderTotal).to.haveOwnProperty('amount');
  expect(order.orderTotal.amount).to.be.a('Number');
}

module.exports.expectOrderState = ({ orderId, state, orders }) => {
  expect(orders[orderId].state).eq(state);
};
