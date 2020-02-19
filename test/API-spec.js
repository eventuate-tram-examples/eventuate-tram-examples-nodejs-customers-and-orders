const chai = require('chai');
const { expect } = chai;
const chaiHttp = require('chai-http');
chai.use(chaiHttp);
const { MessageConsumer, DomainEventDispatcher, DefaultDomainEventNameMapping, eventMessageHeaders: { EVENT_TYPE, AGGREGATE_TYPE } } = require('eventuate-tram-core-nodejs');
const { CustomerEntityTypeName, CustomerCreatedEvent, OrderCreatedEvent, OrderCancelledEvent, OrderEntityTypeName, customerCreditReservedEvent, customerCreditReservationFailedEvent } = require('../common/eventsConfig');
const orderEventHandlers = require('../customer-service/lib/orderEventHandlers');
const orderCreatedEventHandler = orderEventHandlers[OrderEntityTypeName][OrderCreatedEvent];
const orderCanceledEventHandler = orderEventHandlers[OrderEntityTypeName][OrderCancelledEvent];

const host = process.env.DOCKER_HOST_IP;
const port = process.env.TODO_LIST_COMMAND_PORT || 8079;
const baseUrl = `http://${host}:${port}`;
const timeout = 20000;
let customerId = 16;

describe('Services API', function () {
  this.timeout(timeout);

  describe('Customer Service', () => {

    it('POST /customers should return 400 for empty body', async () => {
      const res = await chai.request(baseUrl).post('/customers').send();
      expect(res).to.have.status(400);
    });

    it('POST /customers should create a customer and return customer ID', async () => {
      return new Promise(async (resolve, reject) => {
        const customer = { name: 'Test Customer', creditLimit: { amount: 1000 } };

        const customerEventHandlers = {
          [CustomerEntityTypeName]: {
            [CustomerCreatedEvent]: async (event) => {
              console.log('event', event);
              expect(event[EVENT_TYPE]).eq(CustomerCreatedEvent);
              expect(event[AGGREGATE_TYPE]).eq(CustomerEntityTypeName);

              try {
                const payload = JSON.parse(event.payload);
                expect(payload).to.haveOwnProperty('name');
                expect(payload.name).eq(customer.name);
                expect(payload).haveOwnProperty('creditLimit');
                expect(payload.creditLimit).to.deep.equal(customer.creditLimit);

                await messageConsumer.unsubscribe();
                resolve();
              } catch (e) {
                reject(e)
              }
              resolve();
            }
          }
        };

        const domainEventNameMapping = new DefaultDomainEventNameMapping();
        const messageConsumer = new MessageConsumer();

        const domainEventDispatcher = new DomainEventDispatcher({
          eventDispatcherId: 'customersAndOrdersTestCustomerCreatedEvent',
          domainEventHandlers: customerEventHandlers,
          messageConsumer,
          domainEventNameMapping
        });

        await domainEventDispatcher.initialize();

        const res = await chai.request(baseUrl).post('/customers').send(customer);
        expect(res).to.have.status(200);
        const body = res.body;
        console.log('body', body);
        expect(body).to.be.an('Object');
        expect(body).to.haveOwnProperty('customerId');
        expect(body.customerId).to.be.a('Number');

        customerId = body.customerId;
      });
    });

    describe('Order events', () => {
      it('should process OrderCreatedEvent and publish customerCreditReservedEvent', async () => {
        const orderId = 10;
        const event = {
          messageId: '000001705eaf93d1-0242ac1300080000',
          topic: 'io.eventuate.examples.tram.ordersandcustomers.orders.domain.Order',
          creationTime: 'Wed, 19 Feb 2020 18:22:09 GMT',
          partitionId: orderId,
          payload: `{"orderDetails":{"customerId":${customerId},"orderTotal":{"amount":100}}}`,
          'event-aggregate-type': 'io.eventuate.examples.tram.ordersandcustomers.orders.domain.Order',
          'event-type': 'io.eventuate.examples.tram.ordersandcustomers.commondomain.OrderCreatedEvent'
        };

        return new Promise(async (resolve, reject) => {

          const customerEventHandlers = {
            [CustomerEntityTypeName]: {
              [customerCreditReservedEvent]: async (event) => {
                console.log('customerCreditReservedEvent event', event);
                expect(event[EVENT_TYPE]).eq(customerCreditReservedEvent);
                expect(event[AGGREGATE_TYPE]).eq(CustomerEntityTypeName);

                try {
                  const payload = JSON.parse(event.payload);
                  console.log('payload:', payload);
                  await messageConsumer.unsubscribe();
                  resolve();
                } catch (e) {
                  reject(e)
                }
                resolve();
              }
            }
          };

          const domainEventNameMapping = new DefaultDomainEventNameMapping();
          const messageConsumer = new MessageConsumer();

          const domainEventDispatcher = new DomainEventDispatcher({
            eventDispatcherId: 'customersAndOrdersTestCustomerCreditReservedEvent',
            domainEventHandlers: customerEventHandlers,
            messageConsumer,
            domainEventNameMapping
          });

          await domainEventDispatcher.initialize();

          await orderCreatedEventHandler(event);
        });
      });

      it('should process OrderCreatedEvent and publish customerCreditReservationFailedEvent', async () => {
        const orderId = 10;
        const event = {
          messageId: '000001705eaf93d1-0242ac1300080000',
          topic: 'io.eventuate.examples.tram.ordersandcustomers.orders.domain.Order',
          creationTime: 'Wed, 19 Feb 2020 18:22:09 GMT',
          partitionId: orderId,
          payload: `{"orderDetails":{"customerId":${customerId},"orderTotal":{"amount":1000000}}}`,
          'event-aggregate-type': 'io.eventuate.examples.tram.ordersandcustomers.orders.domain.Order',
          'event-type': 'io.eventuate.examples.tram.ordersandcustomers.commondomain.OrderCreatedEvent'
        };

        return new Promise(async (resolve, reject) => {

          const customerEventHandlers = {
            [CustomerEntityTypeName]: {
              [customerCreditReservationFailedEvent]: async (event) => {
                console.log('customerCreditReservedEvent event', event);
                expect(event[EVENT_TYPE]).eq(customerCreditReservationFailedEvent);
                expect(event[AGGREGATE_TYPE]).eq(OrderEntityTypeName);

                try {
                  const payload = JSON.parse(event.payload);
                  console.log('payload:', payload);
                  await messageConsumer.unsubscribe();
                  resolve();
                } catch (e) {
                  reject(e)
                }
                resolve();
              }
            }
          };

          const domainEventNameMapping = new DefaultDomainEventNameMapping();
          const messageConsumer = new MessageConsumer();

          const domainEventDispatcher = new DomainEventDispatcher({
            eventDispatcherId: 'customersAndOrdersTestCustomerCreditReservedEvent',
            domainEventHandlers: customerEventHandlers,
            messageConsumer,
            domainEventNameMapping
          });

          await domainEventDispatcher.initialize();

          await orderCreatedEventHandler(event);
        });
      });
    });
  })
});