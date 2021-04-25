const mongoose = require('mongoose');

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    description: String,
    imageUrl: { type: String },
    imageKey: { type: String },
    categoryId: { type: String, required: true },
    price: { type: Number },
    isDiscounted: { type: Boolean },
    discountedPrice: { type: Number },
    ingredients: String,
    quantities: String,
    index: Number,
    createdAt: Date,
    updatedAt: Date,
  },
  { collation: { locale: 'en', strength: 1 } }
);

productSchema.set('toJSON', { getters: true });
productSchema.options.toJSON.transform = (doc, ret) => {
  const obj = { ...ret };
  delete obj._id;
  delete obj.__v;
  return obj;
};

module.exports = mongoose.model('Product', productSchema);
