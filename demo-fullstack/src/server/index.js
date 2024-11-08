const express = require('express');
const cors = require('cors');
const CircuitBreaker = require('opossum');
const winston = require('winston');
const { UserProvider } = require('./providers/userProvider');
const errorMiddleware = require('./middleware/errorMiddleware');
const requestLogger = require('./middleware/requestLogger');

// Configure logger
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' })
  ]
});

if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.simple()
  }));
}

const app = express();
const port = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());
app.use(requestLogger(logger));

// Initialize providers
const userProvider = new UserProvider();

// Circuit breaker configuration
const breaker = new CircuitBreaker(async (req) => {
  return await userProvider.getUsers();
}, {
  timeout: 3000, // Time in ms before request is considered failed
  errorThresholdPercentage: 50, // When 50% of requests fail, open circuit
  resetTimeout: 30000 // Time to wait before attempting to reset circuit
});

breaker.fallback(() => {
  return { error: 'Service temporarily unavailable', fallback: true };
});

// Routes
app.get('/api/users', async (req, res, next) => {
  try {
    const result = await breaker.fire();
    res.json(result);
  } catch (error) {
    next(error);
  }
});

// Error handling middleware should be last
app.use(errorMiddleware);

// Start server
app.listen(port, () => {
  logger.info(`Server running on port ${port}`);
});

module.exports = app; // For testing purposes
