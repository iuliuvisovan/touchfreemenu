const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const expressValidator = require('express-validator');
const passport = require('passport');
const localStrategy = require('./services/auth/local');
const jwtStrategy = require('./services/auth/jwt');
const Sentry = require('@sentry/node');
const Tracing = require('@sentry/tracing');

const app = express();

if (process.env.ENABLE_SENTRY) {
  Sentry.init({
    dsn: 'https://d2615e583a7548a281fc04b0de577a82@o717444.ingest.sentry.io/5779948',
    integrations: [
      // enable HTTP calls tracing
      new Sentry.Integrations.Http({ tracing: true }),
      // enable Express.js middleware tracing
      new Tracing.Integrations.Express({
        // to trace all requests to the default router
        app,
        // alternatively, you can specify the routes you want to trace:
        // router: someRouter, 
      }),
    ],

    // We recommend adjusting this value in production, or using tracesSampler
    // for finer control
    tracesSampleRate: 1.0,
  });
}
// The request handler must be the first middleware on the app
app.use(Sentry.Handlers.requestHandler());
// TracingHandler creates a trace for every incoming request
app.use(Sentry.Handlers.tracingHandler());

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
