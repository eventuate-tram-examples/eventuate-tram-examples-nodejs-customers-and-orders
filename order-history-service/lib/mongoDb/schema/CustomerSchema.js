const mongoose = require('mongoose');
const { Schema } = mongoose;

const CustomerSchema = new Schema({
  id: {
    type: Number,
    required: true,
    unique: true
  },
  creationTime: {
    type: Number,
    default: new Date().getTime()
  },
  name: {
    type: String,
    required: true
  },
  creditLimit: {
    type: Object,
    amount: {
      type: mongoose.Decimal128,
      required: true
    }
  },
  orders: {
    type: Object
  }
});

CustomerSchema.set('collection', 'customer');

module.exports = mongoose.model('customer', CustomerSchema);
