const mongoose = require("mongoose");
const { Schema } = mongoose;

const ReturnSchema = new Schema(
  {
    medicine: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Medicine",
      required: true,
    },
    stockEntryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "StockEntry",
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
    },
    returnType: {
      type: String,
      enum: ["customer", "supplier"],
      required: true,
    },
    reason: {
      type: String,
    },
    returnedBy: {
      type: String, // ✅ Add this
      required: true,
    },
    date: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Return", ReturnSchema);
