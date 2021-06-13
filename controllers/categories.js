const Category = require('../models/category');
const Product = require('../models/product');
const { translate } = require('./utils');

exports.create = async (req, res, next) => {
  try {
    const { name, description } = req.body;

    if (!name.trim().length) {
      return res.status(422).json({ message: 'Cannot create category with no name.' });
    }

    const highestCategoryIndex = (await Category.findOne().sort({ index: -1 }))?.index || 0;
    const nameEn = await translate(name);
    const descriptionEn = await translate(description);


    const category = await Category.create({
      name,
      nameEn,
      description,
      descriptionEn,
      index: highestCategoryIndex + 1,
      userId: req.user.id,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    res.status(201).json(category);
  } catch (err) {
    next(err);
  }
};

exports.getAll = async (req, res, next) => {
  try {
    const categories = await Category.find({ userId: req.user.id });
    res.status(200).json(categories);
  } catch (err) {
    next(err);
  }
};

exports.move = async (req, res, next) => {
  try {
    const categories = await Category.find({ userId: req.user.id });
    const { categoryId, destinationIndex } = req.body;

    const draggedItem = categories.find((x) => x.id === categoryId);
    const listWithoutItem = categories.filter((x) => x.id !== categoryId).sort((a, b) => a.index - b.index);

    const newList = [...listWithoutItem.slice(0, destinationIndex - 1), draggedItem, ...listWithoutItem.slice(destinationIndex - 1)];

    newList.forEach((x, i) => {
      x.index = i + 1;
    });

    await Promise.all(
      categories.map(async (category) => {
        const newCategoryIndex = newList.find((x) => x.id == category.id).index;

        await Category.updateOne({ _id: category._id }, { $set: { index: newCategoryIndex } });
      })
    );

    res.status(201).json(newList);
  } catch (err) {
    next(err);
  }
};

exports.edit = async (req, res, next) => {
  try {
    const { id, name, nameEn, description, descriptionEn } = req.body;

    const updatedFields = {
      name,
      nameEn,
      description,
      descriptionEn,
    };
    Object.keys(updatedFields).forEach((key) => updatedFields[key] === undefined && delete updatedFields[key]);

    const updatedCategory = await Category.findByIdAndUpdate(id, { $set: updatedFields }, { new: true });

    res.status(201).json(updatedCategory);
  } catch (err) {
    next(err);
  }
};
exports.delete = async (req, res, next) => {
  try {
    const { categoryId } = req.params;

    await Category.findByIdAndRemove(categoryId);

    await Product.find({ categoryId }).remove();

    await uniformizeIndexes();

    res.status(200).json({ success: true });
  } catch (err) {
    next(err);
  }
};

const uniformizeIndexes = async () => {
  const categories = (await Category.find({})).sort((a, b) => a.index - b.index);
  const newList = [...categories];
  newList.forEach((x, i) => {
    x.index = i + 1;
  });

  await Promise.all(
    categories.map(async (category) => {
      const newCategoryIndex = newList.find((x) => x.id == category.id).index;

      await Category.updateOne({ _id: category._id }, { $set: { index: newCategoryIndex } });
    })
  );
};
