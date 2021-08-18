const DemoRequest = require('../models/demoRequest');

exports.requestDemo = async (req, res, next) => {
  try {
    const { email } = req.body;

    await DemoRequest.create({ email, date: new Date() });
    
    return next();
  } catch (err) {
    next(err);
  }
};
