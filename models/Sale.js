const mongoose = require("mongoose");

const SaleSchema = new mongoose.Schema({
  items: [
    {
      medicine: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Medicine",
        required: true,
      },
      batch: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "StockEntry",
        required: false, // Optional for manual/quick sales
      },
      quantity: {
        type: Number,
        required: true,
        min: [1, "Quantity must be at least 1"],
      },
      price: {
        type: Number,
        required: true,
        min: [0, "Price must be positive"],
      },
      total: {
        type: Number,
        required: true,
        min: [0, "Total must be positive"],
      },
    },
  ],
  grandTotal: {
    type: Number,
    required: true,
    min: [0, "Grand total must be positive"],
  },
  customerName: {
    type: String,
    required: false, // Optional: Used when medicine is sold manually with customer info
    trim: true,
  },
  date: {
    type: Date,
    default: Date.now,
  },
  soldBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "user",
    required: true,
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  }
});

module.exports = mongoose.model("Sale", SaleSchema);
