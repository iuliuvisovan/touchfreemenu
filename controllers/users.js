const { body, validationResult } = require('express-validator/check');
const { login, createAuthToken } = require('../services/auth');
const User = require('../models/user');
const Category = require('../models/category');
const Product = require('../models/product');
const AWS = require('aws-sdk');
const moment = require('moment');
var QRCode = require('qrcode');
moment.locale('ro');
AWS.config.update({ accessKeyId: process.env.AWS_ACCESS_KEY, secretAccessKey: process.env.AWS_SECRET_KEY });

exports.login = (req, res, next) => {
  const result = validationResult(req);

  if (!result.isEmpty()) {
    const errors = result.array({ onlyFirstError: true });
    return res.status(422).json({ errors });
  }

  login(req, res, next);
};

exports.changePassword = async (req, res, next) => {
  const { oldPassword, newPassword } = req.body;

  const { password: currentPassword } = await User.findById(req.user.id);

  if (currentPassword !== oldPassword) {
    return res.status(422).json({ message: 'Ai introdus greșit parola curentă' });
  } else {
    await User.findOneAndUpdate({ _id: req.user.id }, { password: newPassword });
    return res.status(200).json({ success: newPassword });
  }
};

exports.register = async (req, res, next) => {
  const result = validationResult(req);
  if (!result.isEmpty()) {
    const errors = result.array({ onlyFirstError: true });
    return res.status(422).json({ errors });
  }

  try {
    const { username, password, name, email, logoUrl, city, coords, registrationSecret, coverPhotoUrl } = req.body;

    if (registrationSecret !== process.env.REGISTRATION_SECRET) {
      return res.status(422).json({ message: 'Wrong registration secret' });
    }

    const user = await User.create({ username, password, name, email, logoUrl, coverPhotoUrl, city, coords, joinDate: new Date() });

    const token = createAuthToken(user.toJSON());
    res.status(201).json({ token });
  } catch (err) {
    next(err);
  }
};

exports.validate = (method) => {
  const errors = [
    body('username')
      .exists()
      .withMessage('is required')

      .isLength({ min: 1 })
      .withMessage('cannot be blank')

      .isLength({ max: 32 })
      .withMessage('must be at most 32 characters long')

      .custom((value) => value.trim() === value)
      .withMessage('cannot start or end with whitespace')

      .matches(/^[a-zA-Z0-9_-]+$/)
      .withMessage('contains invalid characters'),

    body('password')
      .exists()
      .withMessage('is required')

      .isLength({ min: 1 })
      .withMessage('cannot be blank')

      .isLength({ min: 4 })
      .withMessage('must be at least 8 characters long')

      .isLength({ max: 72 })
      .withMessage('must be at most 72 characters long'),
  ];

  if (method === 'register') {
    errors.push(
      body('username').custom(async (username) => {
        const exists = await User.countDocuments({ username });
        if (exists) throw new Error('already exists');
      }),
      body('name').exists().withMessage('is required'),
      body('email').exists().withMessage('is required'),
      body('logoUrl').exists().withMessage('is required'),
      body('coverPhotoUrl').exists().withMessage('is required'),
      body('city').exists().withMessage('is required'),
      body('coords').exists().withMessage('is required')
    );
  }

  return errors;
};

exports.getCurrentUser = (req, res, next) => {
  res.status(200).json(req.user);
};

exports.downloadQrCode = async (req, res, next) => {
  try {
    const { restaurantSlug } = req.params;

    QRCode.toString(`tfmn.ro/${restaurantSlug}`, { type: 'svg', color: { dark: '#303336' } }, function (err, xml) {
      res.set({
        'Content-Type': 'image/svg+xml',
        'Content-Disposition': 'attachment',
      });
      res.send(xml);
    });
  } catch (err) {
    next(err);
  }
};

const getQRCodeURL = (restaurantSlug) => {
  return new Promise((resolve, reject) => {
    QRCode.toDataURL(`tfmn.ro/${restaurantSlug}`, function (err, url) {
      if (err) {
        reject(err);
        return;
      }
      resolve(url);
    });
  });
};

exports.getQrHolder = async (req, res, next) => {
  try {
    const { restaurantSlug } = req.params;
    const restaurant = await User.findOne({ username: restaurantSlug });
    if (restaurant) {
      return res.render('qr-holder', { restaurantSlug, logoUrl: restaurant.logoUrl });
    } else {
      return res.sendStatus(404);
    }
  } catch (err) {
    next(err);
  }
};

exports.showMenuIfValidSlug = async (req, res, next) => {
  const { restaurantSlug } = req.params;

  const restaurant = await User.findOne({ username: restaurantSlug });

  if (restaurant) {
    const products = await Product.find({ userId: restaurant.id }).lean();
    const categories = await Category.find({ userId: restaurant.id }).lean();

    categories.forEach((category) => {
      category.products = products.filter((y) => y.categoryId == category._id).sort((a, b) => a.index - b.index);
    });

    restaurant.categories = categories.sort((a, b) => a.index - b.index);

    return res.render('web-menu', { restaurant });
  } else {
    next();
  }
};
