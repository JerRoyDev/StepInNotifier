const nodemailer = require('nodemailer');
const logger = require('../utils/logger');

/**
 * Formats price to display with decimal points
 * @param {number} amount - Price amount in cents
 * @returns {string} Formatted price
 */
const formatPrice = (amount) => {
  return (amount / 100).toFixed(2);
};

/**
 * Sends email notification about subscription changes or errors
 * @param {Object} data - Object containing changes or error information
 */
const sendEmail = async (data) => {
  try {
    // Log what data was received for debugging
    logger.info(
      `Email data received - newSubscriptions: ${
        data.newSubscriptions?.length || 0
      }, removedSubscriptions: ${
        data.removedSubscriptions?.length || 0
      }, priceChanges: ${data.priceChanges?.length || 0}`
    );

    if (data.newSubscriptions?.length > 0) {
      logger.info(
        `New subscription IDs to include in email: ${data.newSubscriptions
          .map((s) => s.id)
          .join(', ')}`
      );
    }

    const transporter = nodemailer.createTransport({
      host: process.env.BREVO_SMTP_HOST,
      port: 587,
      secure: false,
      auth: {
        user: process.env.BREVO_SMTP_USER,
        pass: process.env.BREVO_SMTP_PASS,
      },
    });

    let emailContent;
    let subject;
    let recipients;

    if (data.error) {
      // Handle error notification
      emailContent = data.errorContent;
      subject = 'Step In API Error Alert';
      recipients = [process.env.EMAIL_ADMIN];
    } else {
      // Handle subscription changes
      const changes = data;
      emailContent = '<h2>Step In Subscription Changes Detected</h2>';
      emailContent += `<p>Generated at: ${new Date().toLocaleString()}</p>`;

      if (changes.newSubscriptions && changes.newSubscriptions.length > 0) {
        emailContent += '<h3>New Subscriptions:</h3><ul>';
        changes.newSubscriptions.forEach((sub) => {
          logger.info(
            `Adding new subscription to email: ${sub.name} (ID: ${sub.id})`
          );
          emailContent += `<li>${sub.name} (ID: ${sub.id}) - ${formatPrice(
            sub.priceWithInterval.price.amount
          )} ${sub.priceWithInterval.price.currency}</li>`;
        });
        emailContent += '</ul>';
      }

      if (
        changes.removedSubscriptions &&
        changes.removedSubscriptions.length > 0
      ) {
        emailContent += '<h3>Removed Subscriptions:</h3><ul>';
        changes.removedSubscriptions.forEach((sub) => {
          logger.info(
            `Adding removed subscription to email: ${sub.name} (ID: ${sub.id})`
          );
          emailContent += `<li>${sub.name} (ID: ${sub.id}) - ${formatPrice(
            sub.priceWithInterval.price.amount
          )} ${sub.priceWithInterval.price.currency}</li>`;
        });
        emailContent += '</ul>';
      }

      if (changes.priceChanges && changes.priceChanges.length > 0) {
        emailContent += '<h3>Price Changes:</h3><ul>';
        changes.priceChanges.forEach((change) => {
          logger.info(
            `Adding price change to email: ${change.name} (ID: ${change.id})`
          );
          emailContent += `<li>${change.name} (ID: ${change.id}): ${formatPrice(
            change.oldPrice
          )} -> ${formatPrice(change.newPrice)} SEK</li>`;
        });
        emailContent += '</ul>';
      }

      if (
        (!changes.newSubscriptions || changes.newSubscriptions.length === 0) &&
        (!changes.removedSubscriptions ||
          changes.removedSubscriptions.length === 0) &&
        (!changes.priceChanges || changes.priceChanges.length === 0)
      ) {
        emailContent += '<p>No changes detected.</p>';
      }

      subject = 'Step In Subscription Changes Alert';
      recipients = process.env.EMAIL_TO.split(',').map((email) => email.trim());
    }

    const mailOptions = {
      from: process.env.EMAIL_FROM,
      to: recipients,
      subject: subject,
      html: emailContent,
    };

    await transporter.sendMail(mailOptions);

    logger.info(
      `Email notification sent successfully to ${recipients.join(', ')}`
    );
  } catch (error) {
    logger.error(`Failed to send email: ${error.message}`);
    throw error;
  }
};

module.exports = {
  sendEmail,
};
