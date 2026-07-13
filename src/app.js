const express = require('express');
const cors = require('cors');
const routes = require('./routes');
const errorHandler = require('./middleware/error.middleware');

const app = express();

app.use(cors());
app.use(express.json());

// Mount routes
app.use('/', routes);

// Centralized error handler
app.use(errorHandler);

module.exports = app;
