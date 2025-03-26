const fs = require('fs-extra');
const path = require('path');
const config = require('../config/config');

// Ensure log directory exists
if (config.logging.enabled) {
  fs.ensureDirSync(config.logging.logPath);
}

/**
 * Logs a message with timestamp
 * @param {string} message - The message to log
 * @param {string} type - The type of log (info, error, warning)
 */
const log = (message, type = 'info') => {
  if (!config.logging.enabled) return;

  const timestamp = new Date().toISOString();
  const logMessage = `[${timestamp}] ${type.toUpperCase()}: ${message}\n`;

  // Log to console
  console.log(logMessage);

  // Log to file
  const logFile = path.join(config.logging.logPath, `${type}.log`);
  fs.appendFileSync(logFile, logMessage);
};

module.exports = {
  info: (message) => log(message, 'info'),
  error: (message) => log(message, 'error'),
  warning: (message) => log(message, 'warning'),
};
