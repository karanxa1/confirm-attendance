const express = require('express');
const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(express.json());

// Import Firebase Admin configuration
require('./config/firebaseAdminConfig');

// API routes
app.use('/api/users', require('./api/users'));
app.use('/api/classes', require('./api/classes'));

// Start the server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});