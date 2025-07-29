const mongoose = require("mongoose");

const MedicineSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  brandName: {
    type: String,
    required: true,
  },
  genericName: {
    type: String,
    required: true,
  },
  strength: {
    type: String, // e.g. "500mg"
    required: true,
  },
  unit: {
    type: String,
    enum: ["tablet", "strip", "bottle", "syrup"],
    required: true,
  },
  manufacturer: {
    type: String,
    required: true,
  },
  barcode: {
    type: String,
    required: true,
    unique: true,
  },
  stock: {
    type: Number,
    default: 0,
  },
  salePrice: {
    type: Number,
  },
  reorderLevel: {
    type: Number,
    default: 0,
  },
  category: {
    type: String,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Medicine", MedicineSchema);
