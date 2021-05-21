const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    nameEn: String,
    index: Number,
    userId: { type: String, required: true },
    createdAt: Date,
    updatedAt: Date,
  },
  { collation: { locale: 'en', strength: 1 } }
);

categorySchema.index({ 'name': 1, 'userId': 1 }, { 'unique': true });
categorySchema.set('toJSON', { getters: true });
categorySchema.options.toJSON.transform = (doc, ret) => {
  const obj = { ...ret };
  delete obj._id;
  delete obj.__v;
  return obj;
};

module.exports = mongoose.model('Category', categorySchema);
