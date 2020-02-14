const { OrderEntityTypeName, OrderCreatedEvent, OrderCancelledEvent } = require('../../common/eventsConfig');

module.exports = {
  [OrderEntityTypeName]: {
    [OrderCreatedEvent]: () => {

    },
    [OrderCancelledEvent]: () => {

    },
  }
};