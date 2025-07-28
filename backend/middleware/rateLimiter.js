const rateLimit = require('express-rate-limit');

// Limit login attempts: max 5 per 10 minutes
const loginLimiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutes in milliseconds
  max: 5,  // Allow a maximum of 5 requests in 10 minutes
  message: {
    error: 'Too many login attempts. Please try again after 10 minutes.',
  },
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false,  // Disable the `X-RateLimit-*` headers
});

module.exports = {
  loginLimiter,
};
