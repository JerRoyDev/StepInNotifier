// Configuration settings for the application
module.exports = {
  // API endpoint for Step In subscriptions
  apiEndpoint:
    'https://stepin.brpsystems.com/brponline/api/ver3/products/subscriptions',

  // Query parameters
  queryParams: {
    businessUnit: '2612',
    webCategory: '2',
  },

  // Path to store previous data
  dataPath: './data/previousData.json',

  // Email settings
  email: {
    enabled: true,
    from: process.env.EMAIL_FROM,
    to: process.env.EMAIL_TO,
    smtp: {
      host: 'smtp-relay.brevo.com',
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
