const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    name: { type: String, required: true },
    email: { type: String, required: true },
    logoUrl: String,
    coverPhotoUrl: { type: String, required: true },
    joinDate: Date,
    themeColor: String,
    city: String,
    usesFullWidthLogo: { type: Boolean, default: false },
    coords: {
      latitude: Number,
      longitude: Number,
    },
  },
  { collation: { locale: 'en', strength: 1 } },
);

userSchema.set('toJSON', { getters: true });
userSchema.options.toJSON.transform = (doc, ret) => {
  const obj = { ...ret };
  delete obj._id;
  delete obj.__v;
  delete obj.password;
  return obj;
};

userSchema.methods.isValidPassword = async function (password) {
  return password == this.password;
};

const User = mongoose.model('User', userSchema);

module.exports = User;
