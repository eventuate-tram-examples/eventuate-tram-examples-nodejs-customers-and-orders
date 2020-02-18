const chai = require('chai');
const { expect } = chai;
const chaiHttp = require('chai-http');
chai.use(chaiHttp);
const { MessageConsumer, DomainEventDispatcher, DefaultDomainEventNameMapping, eventMessageHeaders: { EVENT_TYPE, AGGREGATE_TYPE } } = require('eventuate-tram-core-nodejs');
const { CustomerEntityTypeName, CustomerCreatedEvent } = require('../common/eventsConfig');

const domainEventNameMapping = new DefaultDomainEventNameMapping();
const messageConsumer = new MessageConsumer();

const host = process.env.DOCKER_HOST_IP;
const port = process.env.TODO_LIST_COMMAND_PORT || 8079;
const baseUrl = `http://${host}:${port}`;
const timeout = 20000;

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
            [CustomerCreatedEvent]: (event) => {
              console.log('event', event);
              expect(event[EVENT_TYPE]).eq(CustomerCreatedEvent);
              expect(event[AGGREGATE_TYPE]).eq(CustomerEntityTypeName);

              try {
                const payload = JSON.parse(event.payload);
                expect(payload).to.haveOwnProperty('name');
                expect(payload.name).eq(customer.name);
                expect(payload).haveOwnProperty('creditLimit');
                expect(payload.creditLimit).to.deep.equal(customer.creditLimit);
                resolve();
              } catch (e) {
                reject(e)
              }
              resolve();
            }
          }
        };

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
      });
    });
  })
});