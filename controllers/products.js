const Product = require('../models/product');
const multer = require('multer');
const multerS3 = require('multer-s3');
const AWS = require('aws-sdk');
AWS.config.update({ accessKeyId: process.env.AWS_ACCESS_KEY, secretAccessKey: process.env.AWS_SECRET_KEY });

exports.uploadImageToS3 = multer({
  storage: multerS3({
    s3: new AWS.S3(),
    acl: 'public-read',
    bucket: process.env.AWS_BUCKET_NAME,
    fileFilter: function (_req, file, cb) {
      const filetypes = /jpeg|jpg|png|gif/;
      const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
      const mimetype = filetypes.test(file.mimetype);

      if (mimetype && extname) {
        return cb(null, true);
      } else {
        cb('Error: Images Only!');
      }
    },
    key: (req, file, cb) => {
      const imageKey = `product-images/${req.user.username}/${+new Date()}-${file.originalname}`;

      req.uploadedImageKey = imageKey;

      cb(null, imageKey);
    },
  }),
}).single('imageFile');

exports.create = async (req, res, next) => {
  try {
    const { name, ingredients, quantities, price, categoryId, discountedPrice, isDiscounted, description } = req.body;

    const highestProductIndex = (await Product.findOne({ categoryId }).sort({ index: -1 }))?.index || 0;

    const product = await Product.create({
      userId: req.user.id,
      categoryId,
      name,
      description,
      imageUrl: req.file?.location || '',
      imageKey: req.uploadedImageKey || '',
      ingredients,
      quantities,
      price,
      isDiscounted,
      discountedPrice,
      index: highestProductIndex + 1,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    res.status(201).json(product);
  } catch (err) {
    next(err);
  }
};

exports.getAll = async (req, res, next) => {
  try {
    const products = await Product.find({ userId: req.user.id });
    res.status(200).json(products);
  } catch (err) {
    next(err);
  }
};

exports.move = async (req, res, next) => {
  try {
    const { productId, destinationIndex } = req.body;
    const productCategoryId = (await Product.findById(productId)).categoryId;

    const products = await Product.find({ categoryId: productCategoryId });

    const draggedItem = products.find((x) => x.id === productId);
    const listWithoutItem = products.filter((x) => x.id !== productId).sort((a, b) => a.index - b.index);

    const newList = [...listWithoutItem.slice(0, destinationIndex - 1), draggedItem, ...listWithoutItem.slice(destinationIndex - 1)];

    newList.forEach((x, i) => {
      x.index = i + 1;
    });

    await Promise.all(
      products.map(async (product) => {
        const newProductIndex = newList.find((x) => x.id == product.id).index;

        await Product.updateOne({ _id: product._id }, { $set: { index: newProductIndex } });
      })
    );

    res.status(201).json(newList);
  } catch (err) {
    next(err);
  }
};

exports.edit = async (req, res, next) => {
  try {
    const { id, name, ingredients, quantities, imageUrl, price, discountedPrice, categoryId, isDiscounted, description } = req.body;

    const originalProduct = await Product.findById(id);

    const updatedFields = {
      name,
      description,
      ingredients,
      quantities,
      price,
      discountedPrice,
      categoryId,
      isDiscounted,
      updatedAt: new Date(),
    };
    Object.keys(updatedFields).forEach((key) => updatedFields[key] === undefined && delete updatedFields[key]);

    //Image has changed
    if (!imageUrl) {
      //Remove old image
      if (originalProduct.imageUrl) {
        await new AWS.S3().deleteObject({ Bucket: process.env.AWS_BUCKET_NAME, Key: originalProduct.imageKey }, console.log);
      }

      //New image has been supplied
      if (req.file) {
        updatedFields.imageUrl = req.file.location;
        updatedFields.imageKey = req.uploadedImageKey;

        //Image has been removed
      } else {
        updatedFields.imageUrl = '';
        updatedFields.imageKey = '';
      }
    }

    const updatedProduct = await Product.findByIdAndUpdate(id, { $set: updatedFields }, { new: true });

    res.status(201).json(updatedProduct);
  } catch (err) {
    next(err);
  }
};

exports.delete = async (req, res, next) => {
  try {
    const { productId } = req.params;

    const productCategoryId = (await Product.findById(productId)).categoryId;

    await Product.findByIdAndRemove(productId);
    await uniformizeProductIndexes(productCategoryId);

    res.status(200).json({ success: true });
  } catch (err) {
    next(err);
  }
};

const uniformizeProductIndexes = async (categoryId) => {
  const products = (await Product.find({ categoryId })).sort((a, b) => a.index - b.index);
  const newList = [...products];
  newList.forEach((x, i) => {
    x.index = i + 1;
  });

  await Promise.all(
    products.map(async (product) => {
      const newProductIndex = newList.find((x) => x.id == product.id).index;

      await Product.updateOne({ _id: product._id }, { $set: { index: newProductIndex } });
    })
  );
};
