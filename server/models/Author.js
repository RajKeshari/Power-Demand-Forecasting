const mongoose = require('mongoose');

const authorSchema = new mongoose.Schema({
    name: { type: String, requires: true },
    designantion: { type: String, requires: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    otp: String,
    otpExpiresAt: Date
}, {
    timestamps: true,
    index: {
        createdAt: 1,
        otp: 1,
        expireAfterSeconds: 300
    }
});

module.exports = mongoose.model('Author', authorSchema);