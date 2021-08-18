const nodeMailer = require('nodemailer');
const nodeMailerClient = nodeMailer.createTransport({
    host: process.env.ZOHO_HOST,
    secure: true,
    port: process.env.ZOHO_PORT,
    auth: {
        user: process.env.ZOHO_USER,
        pass: process.env.ZOHO_PASS,
    },
});

exports.sendEmail = async (req, res, next) => {
    const { email } = req.body;
    const mailOptions = {
        from: process.env.ZOHO_USER,
        to: process.env.ZOHO_USER,
        subject: 'New Demo Request 🚀',
        text: `New demo request has been created by ${email}.`
    };

    try {

        await nodeMailerClient.sendMail(mailOptions);
        res.status(201).json({ succesfullyRequested: true });
    } catch (err) {
        next(err);
    }
}
