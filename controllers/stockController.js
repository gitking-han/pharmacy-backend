const StockEntry = require("../models/StockEntry");

exports.getAllStockEntries = async (req, res) => {
  try {
    const entries = await StockEntry.find({ user: req.user.id }) // ✅ Only fetch current user's entries
      .populate("medicine", "barcode brandName")
      .populate("supplier", "name");

    res.status(200).json({ success: true, entries });
  } catch (error) {
    console.error("💥 Error in getAllStockEntries:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};
