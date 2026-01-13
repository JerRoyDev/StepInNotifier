const logger = require('../utils/logger');
const gistStorage = require('../storage/gistStorage');

const DAILY_LIMIT = 50;

/**
 * Loads email statistics from Gist
 * @returns {Promise<Object>} Email statistics
 */
const loadStats = async () => {
  try {
    const data = await gistStorage.readFile('emailStats.json');
    return data;
  } catch (error) {
    // If error occurs, return default stats
    logger.error(`Failed to load email stats: ${error.message}`);
    return {
      lastReset: new Date().toISOString().split('T')[0],
      sentCount: 0,
    };
  }
};

/**
 * Saves email statistics to Gist
 * @param {Object} stats - Email statistics to save
 */
const saveStats = async (stats) => {
  try {
    await gistStorage.writeFile('emailStats.json', stats);
  } catch (error) {
    logger.error(`Failed to save email stats: ${error.message}`);
  }
};

/**
 * Checks if we can send more emails today
 * @returns {Promise<boolean>} True if we can send more emails
 */
const canSendEmail = async () => {
  const stats = await loadStats();
  const today = new Date().toISOString().split('T')[0];

  // Reset counter if it's a new day
  if (stats.lastReset !== today) {
    stats.lastReset = today;
    stats.sentCount = 0;
    await saveStats(stats);
  }

  // Check if we've reached the daily limit
  if (stats.sentCount >= DAILY_LIMIT) {
    logger.warn(`Daily email limit (${DAILY_LIMIT}) reached`);
    return false;
  }

  return true;
};

/**
 * Increments the email counter
 */
const incrementEmailCount = async () => {
  const stats = await loadStats();
  stats.sentCount += 1;
  await saveStats(stats);
  logger.info(
    `Email count updated: ${stats.sentCount}/${DAILY_LIMIT} for today`
  );
};

module.exports = {
  canSendEmail,
  incrementEmailCount,
  DAILY_LIMIT,
};
