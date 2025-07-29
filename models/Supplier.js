const mongoose = require("mongoose");

const supplierSchema = new mongoose.Schema({
  name: String,
  email: String,
  contact: String,
  address: String,
  status: { type: String, default: "Active" },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  }
});

module.exports = mongoose.model("Supplier", supplierSchema);
