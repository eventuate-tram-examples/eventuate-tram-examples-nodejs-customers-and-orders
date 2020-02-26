const express = require('express');
const orderCommandService = require('./orderService');

const router = express.Router();

router.post('/', async (req, res, next) => {
  const  { customer_id, orderTotal } = req.body;

  if (!customer_id || typeof (orderTotal) === 'undefined') {
    return res.status(400).send('"customer_id" and "orderTotal" should be provided');
  }

  try {
    const orderId = await orderCommandService.create({ customer_id, orderTotal });
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
    res.status(200).send(order);
  } catch (e) {
    next(e);
  }
});

module.exports = router;