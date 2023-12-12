const express = require('express');
const app = express();
const dotenv = require('dotenv');
const path = require('path');
const cors = require('cors');
const Admin = require('./routes/adminRoutes')
dotenv.config();

app.use(express.json()); 

app.use(cors({ origin: true })); // Enable CORS







app.use('/api/admin', Admin)

const port = process.env.PORT || 3600;
const ipAddress = '127.0.0.1';

// Serve static files
app.use('/application', express.static(path.join(__dirname, 'application')));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.listen(port, () => {
    console.log(`Server is running on http://${ipAddress}:${port}`);
});
