const mongoose = require("mongoose");

const StockEntrySchema = new mongoose.Schema({
  medicine: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Medicine",
    required: true,
  },
  supplier: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Supplier",
    required: true,
  },
  invoiceNo: {
    type: String,
    required: true,
    trim: true,
  },
  invoiceDate: {
    type: Date,
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
    min: [0, "Quantity cannot be negative"],
  },
  costPrice: {
    type: Number,
    required: true,
    min: [0, "Cost price must be positive"],
  },
  mrp: {
    type: Number,
    required: true,
    min: [0, "MRP must be positive"],
  },
  expiryDate: {
    type: Date,
    required: true,
    validate: {
      validator: (value) => value > new Date(),
      message: "Expiry date must be in the future",
    },
  },
  barcode: {
    type: String,
    required: true,
    trim: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  }
});

module.exports = mongoose.model("StockEntry", StockEntrySchema);
