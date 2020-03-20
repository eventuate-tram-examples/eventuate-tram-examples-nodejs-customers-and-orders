const mongoose = require('mongoose');
const { getLogger } = require('common-module/logger');

const logger = getLogger({ title: 'order-history-service' });

const mongoDbUri = process.env.MONGODB_URI;
logger.debug(`mongoDbUri: ${mongoDbUri}`);

module.exports.connectMongoDb = () => {
  return  new Promise((resolve, reject) => {

    mongoose.connect(mongoDbUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useCreateIndex: true,
      useFindAndModify: false,
      connectTimeoutMS: 10000
    });

    const db = mongoose.connection;

    db.on('error', reject);

    db.once('open', () => {
      logger.info(`Connected to MongoDB ${mongoDbUri}`);
      resolve();
    });

    db.on('disconnected', () => {
      logger.info(`Disconnected from MongoDB ${mongoDbUri}`);
    });
  });
};
