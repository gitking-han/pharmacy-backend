// controllers/stockEntryController.js

const StockEntry = require("../models/StockEntry");

exports.deleteStockEntry = async (req, res) => {
  try {
    const stock = await StockEntry.findOne({
      _id: req.params.id,
      user: req.user.id, // Ensure it belongs to the logged-in user
    });

    if (!stock) {
      return res.status(404).json({ success: false, error: "Stock entry not found or not authorized" });
    }

    await StockEntry.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: "Stock entry deleted successfully" });
  } catch (err) {
    console.error("Delete Stock Entry Error:", err.message);
    res.status(500).json({ success: false, error: "Server error" });
  }
};
