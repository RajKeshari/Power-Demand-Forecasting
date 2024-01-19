const express = require('express');
const mongo_connection = require('./db');
const authRoutes = require('./routes/auth');
const app = express();
const port = process.env.PORT || 5000;

//connect to mongo
mongo_connection();

app.use(express.json());
app.use('/auth', authRoutes);


// Start server
app.listen(port, () => console.log(`Server started on port ${port}`));
