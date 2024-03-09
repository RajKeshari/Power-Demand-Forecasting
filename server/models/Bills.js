const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    date: { type: String, required: true, unique: true },
    kWh: { type: Number, required: true },
    billValue: { type: Number, required: true }
});
module.exports = mongoose.model('Bills', userSchema);