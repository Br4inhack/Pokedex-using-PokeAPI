const express = require('express');
const cors = require('cors');
const pokemonRoutes = require('./routes/pokemon.routes');
const notFound = require('./middleware/notFound');
const errorHandler = require('./middleware/errorHandler');

const app = express();

// Middlewares
app.use(cors()); // Allow cross-origin requests from any local or remote client
app.use(express.json()); // Parse incoming JSON requests
app.use(express.urlencoded({ extended: true }));

// Simple logger middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} ${req.method} ${req.url}`);
  next(); // MUST call next() to pass control to the next middleware
});

// Health check endpoint
app.get('/health', (req, res) => {
    res.status(200).json({ status: 'OK', message: 'Pokemon API is running' });
});

// Routes
app.use('/api/v1/pokemon',    pokemonRoutes);
app.use('/api/v1/auth',       require('./routes/auth.routes'));
app.use('/api/v1/favorites',  require('./routes/favorites.routes'));

// Fallback middlewares
app.use(notFound);      // 404 handler: creates Error with statusCode 404
app.use(errorHandler);  // Centralized Error handler: sends the JSON response

module.exports = app;
