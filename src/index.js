require('dotenv').config();
const { checkForChanges } = require('./services/subscriptionService');
const logger = require('./utils/logger');

// Run check
checkForChanges()
  .then(() => {
    logger.info('Check completed, exiting...');
    process.exit(0);
  })
  .catch((error) => {
    logger.error(`Error: ${error.message}`);
    process.exit(1);
  });
