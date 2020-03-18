const express = require('express');
const { getCustomerById, customersCount } = require('./orderHistoryService');
const router = express.Router();

router.get('/:customerId', async (req, res, next) => {
  const { params: { customerId }} = req;
  try {

    if (customerId === 'count') {
      const count = await customersCount();
      return res.send(count.toString());
    }

    const customer = await getCustomerById(customerId);
    if (!customer) {
      return res.status(404).send();
    }
    res.send(customer);
  } catch (e) {
    next(e);
  }
});

module.exports = router;