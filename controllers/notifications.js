const parser = require('ua-parser-js');
const geoip = require('geoip-lite');
const nodeMailer = require('nodemailer');
const nodeMailerClient = nodeMailer.createTransport({
  host: 'smtp.zoho.eu',
  secure: true,
  port: 465,
  auth: {
    user: process.env.ZOHO_USER,
    pass: process.env.ZOHO_PASS,
  },
});

exports.sendDemoRequestEmail = async (req, res, next) => {
  const { email } = req.body;
  const mailOptions = {
    from: process.env.ZOHO_USER,
    to: process.env.ZOHO_USER,
    subject: 'New Demo Request 🚀',
    text: `New demo request has been created by ${email}.`,
  };

  try {
    await nodeMailerClient.sendMail(mailOptions);
    res.status(201).json({ succesfullyRequested: true });
  } catch (err) {
    next(err);
  }
};

exports.sendNavigationEmail = async (req) => {
  const requestInfo = parser(req.headers['user-agent']);

  const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;

  requestInfo.ip = ip;

  const geo = geoip.lookup(ip.split(',')[0]) || {};

  const mailOptions = {
    from: process.env.ZOHO_USER,
    to: process.env.ZOHO_USER,
    subject: `[${process.env.ENV}] New Navigation to ${req.originalUrl} (${requestInfo.browser.name} on ${requestInfo.os.name} ${requestInfo.os.version})`,
    text: `[${process.env.ENV}] New navigation to ${req.originalUrl}

    Location: ${geo.city}, ${geo.region}, ${geo.country}
    Platform: ${requestInfo.os.name} (v${requestInfo.os.version})
    Browser: ${requestInfo.browser.name} (v${requestInfo.browser.version})

    ----------------------

    Full request: 

    ${JSON.stringify(requestInfo, null, 4)}


    Geo: 
    
    ${JSON.stringify(geo, null, 4)}`,
  };

  console.log('mailOptions', mailOptions);

  try {
    await nodeMailerClient.sendMail(mailOptions);
    console.log('mailOptions', mailOptions);
  } catch (err) {
    console.log('err', err);
  }
};
