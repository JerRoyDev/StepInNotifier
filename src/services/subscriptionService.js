const axios = require('axios');
const fs = require('fs-extra');
const path = require('path');
const config = require('../config/config');
const logger = require('../utils/logger');
const { sendEmail } = require('./emailService');

/**
 * Filters subscription data to only include subscriptions for Step In Backcity
 * @param {Array} data - Subscription data to filter
 * @returns {Array} Filtered subscription data
 */
const filterBackcitySubscriptions = (data) => {
  return data.filter((subscription) =>
    subscription.businessUnits.some((unit) => unit.id === 2612)
  );
};

/**
 * Sends error notification email
 * @param {Error} error - The error that occurred
 */
const sendErrorNotification = async (error) => {
  try {
    const errorContent = `
      <h2>Step In API Error Alert</h2>
      <p>An error occurred while fetching subscription data from Step In API.</p>
      <h3>Error Details:</h3>
      <ul>
        <li>Message: ${error.message}</li>
        <li>Time: ${new Date().toLocaleString()}</li>
        ${error.response ? `<li>Status: ${error.response.status}</li>` : ''}
        ${
          error.response
            ? `<li>Data: ${JSON.stringify(error.response.data)}</li>`
            : ''
        }
      </ul>
    `;

    const mailOptions = {
      from: process.env.EMAIL_FROM,
      to: process.env.EMAIL_ADMIN,
      subject: 'Step In API Error Alert',
      html: errorContent,
    };

    await sendEmail({ error: true, errorContent });
    logger.info('Error notification email sent successfully');
  } catch (emailError) {
    logger.error(
      `Failed to send error notification email: ${emailError.message}`
    );
  }
};

/**
 * Fetches subscription data from Step In API
 * @returns {Promise<Array>} Array of subscription data
 */
const fetchSubscriptionData = async () => {
  try {
    const response = await axios.get(config.apiEndpoint, {
      params: config.queryParams,
    });

    // Filter for Backcity subscriptions only
    const backcityData = filterBackcitySubscriptions(response.data);
    logger.info(
      `Fetched ${backcityData.length} Backcity subscriptions from API`
    );
    return backcityData;
  } catch (error) {
    logger.error(`Failed to fetch subscription data: ${error.message}`);
    await sendErrorNotification(error);
    throw error;
  }
};

/**
 * Loads previous subscription data from file
 * @returns {Promise<Array>} Previous subscription data
 */
const loadPreviousData = async () => {
  try {
    if (await fs.pathExists(config.dataPath)) {
      const data = await fs.readJson(config.dataPath);
      // Filter data to only include Backcity subscriptions
      return filterBackcitySubscriptions(data);
    }
    return [];
  } catch (error) {
    logger.error(`Failed to load previous data: ${error.message}`);
    return [];
  }
};

/**
 * Saves current subscription data to file
 * @param {Array} data - Current subscription data
 */
const saveCurrentData = async (data) => {
  try {
    // Filter data to only include Backcity subscriptions before saving
    const backcityData = filterBackcitySubscriptions(data);
    await fs.writeJson(config.dataPath, backcityData, { spaces: 2 });
    logger.info(`Saved ${backcityData.length} Backcity subscriptions to file`);
  } catch (error) {
    logger.error(`Failed to save current data: ${error.message}`);
  }
};

/**
 * Compares current and previous subscription data
 * @param {Array} currentData - Current subscription data
 * @param {Array} previousData - Previous subscription data
 * @returns {Object} Object containing all changes
 */
const compareData = (currentData, previousData) => {
  const changes = {
    newSubscriptions: [],
    removedSubscriptions: [],
    priceChanges: [],
  };

  // Create maps for easier comparison
  const currentMap = new Map(currentData.map((item) => [item.id, item]));
  const previousMap = new Map(previousData.map((item) => [item.id, item]));

  // Check for new subscriptions
  for (const [id, subscription] of currentMap) {
    if (!previousMap.has(id)) {
      changes.newSubscriptions.push(subscription);
      logger.info(
        `New Backcity subscription added: ${subscription.name} (ID: ${id})`
      );
    }
  }

  // Check for removed subscriptions
  for (const [id, subscription] of previousMap) {
    if (!currentMap.has(id)) {
      changes.removedSubscriptions.push(subscription);
      logger.info(
        `Backcity subscription removed: ${subscription.name} (ID: ${id})`
      );
    }
  }

  // Check for price changes
  for (const [id, current] of currentMap) {
    const previous = previousMap.get(id);
    if (previous) {
      const currentPrice = current.priceWithInterval.price.amount;
      const previousPrice = previous.priceWithInterval.price.amount;

      if (currentPrice !== previousPrice) {
        changes.priceChanges.push({
          id,
          name: current.name,
          oldPrice: previousPrice,
          newPrice: currentPrice,
        });
        logger.info(
          `Price change for Backcity subscription ${current.name} (ID: ${id}): ${previousPrice} -> ${currentPrice} SEK`
        );
      }
    }
  }

  // Add debug logging to see what changes were detected
  logger.info(`New subscriptions: ${changes.newSubscriptions.length}`);
  logger.info(`Removed subscriptions: ${changes.removedSubscriptions.length}`);
  logger.info(`Price changes: ${changes.priceChanges.length}`);

  // Add detailed debug info
  if (changes.newSubscriptions.length > 0) {
    logger.info(
      `New subscription IDs: ${changes.newSubscriptions
        .map((s) => s.id)
        .join(', ')}`
    );
  }
  if (changes.removedSubscriptions.length > 0) {
    logger.info(
      `Removed subscription IDs: ${changes.removedSubscriptions
        .map((s) => s.id)
        .join(', ')}`
    );
  }

  return changes;
};

/**
 * Main function to check for changes in subscription data
 * @returns {Promise<void>}
 */
async function checkForChanges() {
  try {
    logger.info('Starting subscription check...');

    const currentData = await fetchSubscriptionData();
    const previousData = await loadPreviousData();

    // Log the counts to help diagnose the issue
    logger.info(`Current data count: ${currentData.length}`);
    logger.info(`Previous data count: ${previousData.length}`);

    const changes = compareData(currentData, previousData);

    // Ensure there's some meaningful content before sending email
    const hasChanges =
      changes.newSubscriptions.length > 0 ||
      changes.removedSubscriptions.length > 0 ||
      changes.priceChanges.length > 0;

    if (hasChanges) {
      logger.info(`Changes detected - sending email notification`);
      await sendEmail(changes);
    } else {
      logger.info('No changes detected');
    }

    await saveCurrentData(currentData);
    logger.info('Subscription check completed');
  } catch (error) {
    logger.error('Error in checkForChanges:', error);
    throw error;
  }
}

module.exports = {
  checkForChanges,
};
