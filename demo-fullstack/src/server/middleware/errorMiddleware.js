/**
 * Global error handling middleware
 * Handles all errors thrown in the application
 */
const errorMiddleware = (err, req, res, next) => {
    // Log error for debugging
    console.error(err.stack);

    // Determine error type and set appropriate status code
    let statusCode = 500;
    let message = 'Internal Server Error';

    if (err.name === 'ValidationError') {
        statusCode = 400;
        message = err.message;
    } else if (err.name === 'NotFoundError') {
        statusCode = 404;
        message = err.message;
    } else if (err.name === 'UnauthorizedError') {
        statusCode = 401;
        message = 'Unauthorized access';
    }

    // Send error response
    res.status(statusCode).json({
        success: false,
        error: {
            message,
            ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
        }
    });
};

module.exports = errorMiddleware;
