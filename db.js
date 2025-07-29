
const mongoose = require('mongoose');
const mongoURI = "mongodb+srv://hanzalarehman804:bitsphile@cluster0.gicunyt.mongodb.net/pharmacy?retryWrites=true&w=majority&appName=Cluster0";


const connectToMongo = async () => {
  try {
    await mongoose.connect(mongoURI);
    console.log("Connected to MongoDB successfully");
  } catch (error) {
    console.error("MongoDB connection failed:", error);
  }
};

module.exports = connectToMongo;
