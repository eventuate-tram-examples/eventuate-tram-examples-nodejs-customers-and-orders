const mongoose = require('mongoose');
const { Schema } = mongoose;

const OrderSchema = new Schema({
  id: {
    type: Number,
    required: true,
    unique: true
  },
  customerId: {
    type: Number,
    required: true,
  },
  state: {
    type: String,
    required: true
  },
  orderTotal: {
    type: Object
  }
});

OrderSchema.set('collection', 'order');

module.exports = mongoose.model('order', OrderSchema);
