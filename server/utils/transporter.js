const nodemailer = require('nodemailer')

const transporter = nodemailer.createTransport({
    host: 'smtp.ethereal.email',
    port: 587,
    auth: {
        user: 'emelia.hagenes@ethereal.email',
        pass: 'jRnFEfhgba6arNDRXw'
    }
});

module.exports = transporter;