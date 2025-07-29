const StockEntry = require("../models/StockEntry");
const Medicine = require("../models/Medicine");

exports.createStockEntry = async (req, res) => {
  try {
    const { supplierId, invoiceNo, invoiceDate, batches } = req.body;

    if (!Array.isArray(batches) || batches.length === 0) {
      return res.status(400).json({
        success: false,
        message: "No batches provided.",
      });
    }

    for (const batch of batches) {
      const { barcode, quantity, costPrice, mrp, expiryDate } = batch;

      const medicine = await Medicine.findOne({ barcode, user: req.user.id });
      if (!medicine) {
        console.warn(`⚠ Medicine not found for barcode: ${barcode}`);
        continue; // Skip this batch
      }

      const stockEntry = new StockEntry({
        medicine: medicine._id,
        supplier: supplierId,
        invoiceNo,
        invoiceDate,
        quantity,
        costPrice,
        mrp,
        expiryDate,
        barcode,
        user: req.user.id, // ✅ Important
      });

      await stockEntry.save();

      // Update medicine stock
      medicine.stock += Number(quantity);
      await medicine.save();
    }

    res
      .status(200)
      .json({ success: true, message: "Stock batches added successfully." });
  } catch (error) {
    console.error("💥 Error in createStockEntry:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};
