const mongoose = require('mongoose');
const { Schema } = mongoose;

const OrderSchema = new Schema({
  orderId: {
    type: Number,
    required: true,
    unique: true
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
