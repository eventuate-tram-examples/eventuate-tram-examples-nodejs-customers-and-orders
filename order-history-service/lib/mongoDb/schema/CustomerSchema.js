const mongoose = require('mongoose');
const { Schema } = mongoose;

const CustomerSchema = new Schema({
  id: {
    type: Number,
    required: true,
    unique: true
  },
  name: {
    type: String,
    required: true
  },
  creditLimit: {
    type: mongoose.Decimal128,
    required: true
  }
});

CustomerSchema.set('collection', 'customer');

module.exports = mongoose.model('customer', CustomerSchema);
