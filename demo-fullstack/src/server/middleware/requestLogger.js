/**
 * Request logging middleware
 * Logs incoming requests with timing information
 * @param {Object} logger - Winston logger instance
 */
const requestLogger = (logger) => {
    return (req, res, next) => {
        const start = Date.now();
        const { method, url, ip } = req;

        // Log request start
        logger.info(`Incoming ${method} request to ${url} from ${ip}`);

        // Once the request is processed
        res.on('finish', () => {
            const duration = Date.now() - start;
            const { statusCode } = res;

            // Log request completion
            logger.info({
                method,
                url,
                statusCode,
                duration: `${duration}ms`,
                ip
            });
        });

        next();
    };
};

module.exports = requestLogger;
