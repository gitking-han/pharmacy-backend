const connectToMongo = require('./db');
const express = require('express');
const cors = require('cors');

// Connect to MongoDB
connectToMongo();

const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', require('./routes/auth'));         // User auth (login/register)
app.use('/api/medicine', require('./routes/medicine')); // Medicine CRUD
app.use('/api/sale', require('./routes/sale'));         // Sale handling (via barcode)
app.use('/api/stock-entry', require('./routes/stockEntry')); // Stock entry management
app.use("/api/suppliers", require("./routes/suppliers"));
app.use("/api/return", require("./routes/return"));
app.use('/api/profile', require('./routes/profile'));





// Start server
app.listen(port, () => {
  console.log(`Backend Pharmacy listening at http://localhost:${port}`);
});
