require('dotenv').config();
const app = require('./app');

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
    console.log(`========================================`);
    console.log(`⚡️ Server is running on port ${PORT}`);
    console.log(`🌱 Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`🏥 Health Check: http://localhost:${PORT}/health`);
    console.log(`========================================`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
    console.error(`Unhandled Rejection Error: ${err.message}`);
    // Close server & exit process
    server.close(() => process.exit(1));
});
