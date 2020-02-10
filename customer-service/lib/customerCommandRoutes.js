const express = require('express');
const customerCommandService = require('./customerService');

const router = express.Router();

router.post('/', async (req, res, next) => {
  const  { name, creditLimit } = req.body;

  if (!name || typeof (creditLimit) === 'undefined') {
    return res.status(400).send('"name" and "creditLimit" should be provided');
  }

  try {
    const customerId = await customerCommandService.create({ name, creditLimit });

    res.status(200).send({ customerId });
  } catch (e) {
    next(e);
  }

});

module.exports = router;