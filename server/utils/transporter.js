require('dotenv').config();
const nodemailer = require('nodemailer')

const transporter = nodemailer.createTransport({
    host: process.env.TRANSPORTER_HOST,
    port: process.env.TRANSPORTER_PORT,
    auth: {
        user: process.env.TRANSPORTER_AUTH_USER,
        pass: process.env.TRANSPORTER_AUTH_PASSWORD
    }
});

module.exports = transporter;