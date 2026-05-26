// src/middleware/errorHandler.js
// Global error handler — catches any error passed to next(error)
// Express identifies error middleware by its 4-parameter signature: (err, req, res, next)
// This MUST be registered LAST in app.js

function errorHandler(err, req, res, next) {
    // Log the full error server-side (don't send stack traces to clients)
    console.error(`[Error] ${err.message}`);
    if (process.env.NODE_ENV === 'development') {
        console.error(err.stack);
    }

    // Use the statusCode we attached to the error in the service,
    // or default to 500 Internal Server Error
    const statusCode = err.statusCode || 500;

    // Always return the same error shape — clients can rely on this structure
    res.status(statusCode).json({
        success: false,
        error: {
            message: err.message || 'An unexpected error occurred',
            // Only include stack trace in development — never in production
            ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
        }
    });
}

module.exports = errorHandler;