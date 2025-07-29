const StockEntry = require("../models/StockEntry");

exports.updateStockEntry = async (req, res) => {
  try {
    const userId = req.user.id; // From fetchuser middleware

    // Find the stock entry and ensure it belongs to current user
    const stockEntry = await StockEntry.findOne({
      _id: req.params.id,
      user: userId,
    });

    if (!stockEntry) {
      return res.status(404).json({
        success: false,
        error: "Stock entry not found or unauthorized",
      });
    }

    // Update allowed fields only (for safety)
    const allowedFields = [
      "invoiceNo",
      "invoiceDate",
      "quantity",
      "costPrice",
      "mrp",
      "expiryDate",
      "supplier",
    ];
    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        stockEntry[field] = req.body[field];
      }
    });

    await stockEntry.save();

    res.json({ success: true, stock: stockEntry });
  } catch (err) {
    console.error("Update Stock Entry Error:", err.message);
    res.status(500).json({ success: false, error: "Server error" });
  }
};
