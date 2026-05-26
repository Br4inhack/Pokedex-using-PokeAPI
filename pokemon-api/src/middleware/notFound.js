/**
 * Middleware to handle requests for routes that do not exist.
 * Formats a clean 404 error object with statusCode.
 */
const notFound = (req, res, next) => {
    const error = new Error(`Route ${req.method} ${req.originalUrl} not found`);
    error.statusCode = 404;
    next(error);
};

module.exports = notFound;
