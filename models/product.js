const mongoose = require('mongoose');

const productSchema = new mongoose.Schema(
  {
    userId: { type: String, required: true },
    categoryId: { type: String, required: true },
    name: { type: String, required: true },
    description: String,
    imageUrl: { type: String },
    imageKey: { type: String },
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
