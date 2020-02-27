const express = require('express');
const router = express.Router();
const { getLogger } = require('../../common/logger');
const orderCommandService = require('./orderService');
const logger = getLogger({ title: 'order-service' });
const Order = require('./aggregates/Order');

router.post('/', async (req, res, next) => {
  logger.debug('Create order route', { body: req.body });
  const  { customerId, orderTotal } = req.body;

  if (!customerId || typeof (orderTotal) === 'undefined') {
    return res.status(400).send('"customer_id" and "orderTotal" should be provided');
  }

  try {
    const orderId = await orderCommandService.create({ customerId, orderTotal });
    res.status(200).send({ orderId });
  } catch (e) {
    next(e);
  }
});

router.get('/:orderId', async (req, res, next) => {
  const orderId = req.params.orderId;

  try {
    const order = await orderCommandService.getOrderById(orderId);

    if (!order) {
      res.status(404).send('Order not found');
    }
    res.status(200).send({
      orderId: order.id,
      orderState: Object.keys(Order.orderState)[order.state],
    });
  } catch (e) {
    next(e);
  }
});

router.post('/:orderId/cancel', async (req, res, next) => {
  const orderId = req.params.orderId;

  try {
    const order = await orderCommandService.cancelOrder(orderId);
    res.status(200).send(order);
  } catch (e) {
    if (e.message === 'OrderNotExistsException') {
      return res.status(404).send();
    }
    next(e);
  }
});

module.exports = router;