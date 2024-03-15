const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  firstName: { type: String, requires: true },
  lastName: { type: String, requires: true },
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
    // Partial index with TTL on documents where `otp` exists:
    "$**": 1, // Includes all fields in the index
    partialFilterExpression: { otp: { $exists: true } },
    expireAfterSeconds: 300
  }
});
module.exports = mongoose.model('User', userSchema);