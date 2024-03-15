const express = require('express');
const mongo_connection = require('./db');
const authRoutes = require('./routes/auth');
const powerRoutes = require('./routes/powerDemand');
const app = express();
const port = process.env.PORT || 5000;
const cors = require('cors');
//connect to mongo
mongo_connection();

app.use(cors());
app.use(express.json());
app.use('/auth', authRoutes);
app.use('/power', powerRoutes);

// Start server
app.listen(port, () => console.log(`Server started on port ${port}`));
