const demoRequests = require('./controllers/demoRequests');
const users = require('./controllers/users');
const categories = require('./controllers/categories');
const products = require('./controllers/products');
const auth = require('./services/auth');
const express = require('express');
const router = express.Router();
const yamljs = require('yamljs');
const swaggerUi = require('swagger-ui-express');
const swaggerDoc = yamljs.load('swagger/api.yaml');


router.post('/request-demo', demoRequests.requestDemo);
router.post('/login', users.login);
router.post('/change-password', auth.withCurrentUser, users.changePassword);
router.post('/register', users.validate(), users.register);
router.get('/get-current-user', auth.withCurrentUser, users.getCurrentUser);

router.get('/categories', auth.withCurrentUser, categories.getAll);
router.post('/categories', auth.withCurrentUser, categories.create);
router.put('/categories', auth.withCurrentUser, categories.edit);
router.delete('/categories/:categoryId', auth.withCurrentUser, categories.delete);
router.post('/categories/move', auth.withCurrentUser, categories.move);

router.get('/products', auth.withCurrentUser, products.getAll);
router.post('/products', auth.withCurrentUser, products.uploadImageToS3, products.create);
router.put('/products', auth.withCurrentUser, products.uploadImageToS3, products.edit);
router.delete('/products/:productId', auth.withCurrentUser, products.delete);
router.post('/products/move', auth.withCurrentUser, products.move);

module.exports = (app) => {
  app.use('/api', router);
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDoc));

  app.use((req, res, next) => {
    const lastIndexOfSlash = (req.headers.referer || '').lastIndexOf('/');
    const requestedPath = (req.headers.referer || '').slice(lastIndexOfSlash + 1);

    if ([...(req.headers.referer || '')].filter((x) => x === '/').length == 3 && requestedPath.length > 0) {
      express.static('web-menu')(req, res, next);
    } else {
      express.static('presentation-site')(req, res, next);
    }

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

    return res.status(500).json(err);
  });
};
