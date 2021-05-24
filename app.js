const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const expressValidator = require('express-validator');
const passport = require('passport');
const localStrategy = require('./services/auth/local');
const jwtStrategy = require('./services/auth/jwt');
const Sentry = require('@sentry/node');

const app = express();

Sentry.init({
  dsn: 'https://d2615e583a7548a281fc04b0de577a82@o717444.ingest.sentry.io/5779948',

  // Set tracesSampleRate to 1.0 to capture 100%
  // of transactions for performance monitoring.
  // We recommend adjusting this value in production
  tracesSampleRate: 1.0,
});

// The request handler must be the first middleware on the app
app.use(Sentry.Handlers.requestHandler());

// set the view engine to ejs
app.set('view engine', 'ejs');
app.use(cors());
app.use(express.json());
app.use(expressValidator());
app.use(morgan('common'));
app.use(passport.initialize());

passport.use(localStrategy);
passport.use(jwtStrategy);

require('./routes')(app);

module.exports = app;
