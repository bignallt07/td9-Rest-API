'use strict';

// load modules
const express = require('express');
const morgan = require('morgan');

// Getting the routes
const routes = require('./routes');

// Require Sequelize Instance from Model index.js
const db = require("./models");


// variable to enable global error logging
const enableGlobalErrorLogging = process.env.ENABLE_GLOBAL_ERROR_LOGGING === 'true';

// create the Express app
const app = express();

// setup morgan which gives us http request logging
app.use(morgan('dev'));

// setup a friendly greeting for the root route
app.get('/', (req, res) => {
  res.json({
    message: 'Welcome to the REST API project!',
  });
});

// Allow Express to work with JSON
app.use(express.json());
// Add routes.
app.use('/api', routes);


// send 404 if no other route matched
app.use((req, res) => {
  res.status(404).json({
    message: 'Route Not Found',
  });
});

// setup a global error handler
app.use((err, req, res, next) => {
  if (enableGlobalErrorLogging) {
    console.error(`Global error handler: ${JSON.stringify(err.stack)}`);
  }

  res.status(err.status || 500).json({
    message: err.message,
    error: {},
  });
});

// Connect to the database
(async () => {
  // await db.sequelize.sync(); // Maybe add later
  try {
    await db.sequelize.authenticate();
    console.log("CONNECTION TO THE DATABASE ESTABLISHED");
  } catch (error) {
    console.error("UNABLE TO CONNECT TO THE DATABASE", error);
  }
}) ();

// set our port
app.set('port', process.env.PORT || 5000);

// start listening on our port
const server = app.listen(app.get('port'), () => {
  console.log(`Express server is listening on port ${server.address().port}`);
});
