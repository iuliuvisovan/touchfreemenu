const demoRequests = require('./controllers/demoRequests');
const notifications = require('./controllers/notifications');
const users = require('./controllers/users');
const categories = require('./controllers/categories');
const products = require('./controllers/products');
const upload = require('./controllers/upload');
const auth = require('./services/auth');
const express = require('express');
const router = express.Router();
const yamljs = require('yamljs');
const swaggerUi = require('swagger-ui-express');
const swaggerDoc = yamljs.load('swagger/api.yaml');
const Sentry = require('@sentry/node');

router.post('/request-demo', demoRequests.requestDemo, notifications.sendDemoRequestEmail);
router.post('/login', users.login);
router.post('/change-password', auth.withCurrentUser, users.changePassword);
router.post('/register', upload.uploadLogosToS3, users.validate(), users.register);
router.get('/get-current-user', auth.withCurrentUser, users.getCurrentUser);

router.get('/categories', auth.withCurrentUser, categories.getAll);
router.post('/categories', auth.withCurrentUser, categories.create);
router.put('/categories', auth.withCurrentUser, categories.edit);
router.delete('/categories/:categoryId', auth.withCurrentUser, categories.delete);
router.post('/categories/move', auth.withCurrentUser, categories.move);

router.get('/products', auth.withCurrentUser, products.getAll);
router.post('/products', auth.withCurrentUser, upload.uploadImageToS3, products.create);
router.put('/products', auth.withCurrentUser, upload.uploadImageToS3, products.edit);
router.delete('/products/:productId', auth.withCurrentUser, products.delete);
router.post('/products/move', auth.withCurrentUser, products.move);

module.exports = (app) => {
  app.use('/api', router);
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDoc));

  // The error handler must be before any other error middleware and after all controllers
  app.use(Sentry.Handlers.errorHandler());

  app.use((req, res, next) => {
    const { s, source } = req.query;
    if (s || source) {
      notifications.sendNavigationEmail(req);
    }

    express.static('static')(req, res, next);

    app.get('/iuliu/my-business-card', users.getBussinesCardFront);
    app.get('/iuliu/my-business-card-back', users.getBussinesCardBack);
    app.get('/iuliu/flyer', users.getFlyerFront);
    app.get('/iuliu/flyer-back', users.getFlyerBack);
    app.get('/base-qr-code.svg', users.downloadBaseQrCode);
    app.get('/:restaurantSlug/my-qr-code.svg', users.downloadQrCode);
    app.get('/:restaurantSlug/my-qr-holder', users.getQrHolder);
    app.get('/:restaurantSlug', users.showMenuIfValidSlug);

    app.get('/api/*', (req, res, next) => {
      res.status(404).json({ message: 'not found 2' });
    });

    app.get('*', (req, res, next) => {
      return res.redirect('https://touchfreemenu.ro/');
    });
  });

  app.use((err, req, res, next) => {
    if (err.type === 'entity.parse.failed') {
      return res.status(400).json({ message: 'bad request' });
    }
    if (err.type === 'invalidFileName') {
      return res.status(400).json({ message: err.message });
    }

    console.log('err', err);
    Sentry.captureException(err);
    return res.status(500).json(err);
  });
};
