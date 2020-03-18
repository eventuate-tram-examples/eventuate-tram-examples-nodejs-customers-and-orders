const express = require('express');
const { getOrderById } = require('./orderHistoryService');

const router = express.Router();

router.get('/:orderId', async (req, res, next) => {
  const { params: { orderId }} = req;
  try {
    const order = await getOrderById(orderId);
    if (!order) {
      return res.status(404).send();
    }
    res.send(order);
  } catch (e) {
    next(e);
  }
});

module.exports = router;