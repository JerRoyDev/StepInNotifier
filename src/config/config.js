require('dotenv').config();

// Configuration settings for the application
module.exports = {
  // API endpoint for Step In subscriptions
  apiEndpoint: process.env.STEPIN_API_ENDPOINT,

  // Query parameters for filtering subscriptions
  queryParams: {
    businessUnit: process.env.STEPIN_BUSINESS_UNIT_ID || '2612',
    webCategory: '2',
  },

  // Path to store previous data
  dataPath: './data/previousData.json',

  // Email settings
  email: {
    dailyLimit: 50,
    from: process.env.EMAIL_FROM,
    to: process.env.EMAIL_TO,
    smtp: {
      host: process.env.BREVO_SMTP_HOST,
      port: 587,
      secure: false,
      auth: {
        user: process.env.BREVO_SMTP_USER,
        pass: process.env.BREVO_SMTP_PASS,
      },
    },
  },

  // Logging settings
  logging: {
    enabled: true,
    logPath: './logs',
  },
};
