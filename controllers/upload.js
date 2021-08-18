const multer = require('multer');
const multerS3 = require('multer-s3-transform');
const AWS = require('aws-sdk');
const sharp = require('sharp');
const path = require('path');

AWS.config.update({
  accessKeyId: process.env.AWS_ACCESS_KEY,
  secretAccessKey: process.env.AWS_SECRET_KEY
});

const imageFilter = (req, file, cb) => {
  const filetypes = /jpeg|jpg|png|gif/;
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = filetypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb('Error: Images Only!');
  }
};

exports.uploadLogosToS3 = multer({
  fileFilter: imageFilter,
  storage: multerS3({
    s3: new AWS.S3(),
    acl: 'public-read',
    bucket: process.env.AWS_BUCKET_NAME,
    key: function (req, file, cb) {
      let imageKey;
      const fileExtension = path.extname(file.originalname);

      if (file.fieldname === 'logoUrl') {
        imageKey = `brand-logos/${req.body.username}${fileExtension}`;
        req.uploadedLogoUrl = imageKey;
      } else {
        imageKey = `brand-cover-photos/${req.body.username}${fileExtension}`;
        req.uploadedCoverUrl = imageKey;
      }

      cb(null, imageKey);
    }
  }),
}).fields([
  { name: "logoUrl", maxCount: 1 },
  { name: "coverPhotoUrl", maxCount: 1 }
]);

exports.uploadImageToS3 = multer({
  fileFilter: imageFilter,
  storage: multerS3({
    s3: new AWS.S3(),
    acl: 'public-read',
    bucket: process.env.AWS_BUCKET_NAME,
    shouldTransform: function (_, _, cb) {
      cb(null, true);
    },
    key: function (req, file, cb) {
      const imageKey = `product-images/${req.user.username}/${+new Date()}-${file.originalname}`;

      req.uploadedImageKey = imageKey;

      cb(null, imageKey);
    },
    transforms: [
      {
        id: 'original',
        key: function (req, file, cb) {
          const imageKey = `product-images/${req.user.username}/${+new Date()}-${file.originalname}`;

          req.uploadedImageKey = imageKey;

          cb(null, imageKey);
        },
        transform: async function (_, file, cb) {
          cb(null, sharp().resize(1600).withMetadata().jpeg({ quality: 85 }));
        },
      },
    ],
  }),
}).single('imageFile');
