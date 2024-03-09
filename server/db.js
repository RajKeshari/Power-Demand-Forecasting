const mongoose = require('mongoose');
require('dotenv').config();
const connect_to_mongo = () => {
    // console.log(process.env.MONGODB_URI);
    mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
        .then(() => console.log('MongoDB connected'))
        .catch(err => console.error(err));
}

module.exports = connect_to_mongo;