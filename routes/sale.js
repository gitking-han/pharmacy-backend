const express = require("express");
const router = express.Router();

require("../models/User");

const Medicine = require("../models/Medicine");
const Sale = require("../models/Sale");
const StockEntry = require("../models/StockEntry");
const fetchuser = require("../middleware/fetchuser");

// 🔒 Secure Sale: Multiple Items
router.post("/sell", fetchuser, async (req, res) => {
  const { items, customerName } = req.body;
  const userId = req.user?.id;

  if (!Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ success: false, message: "No items provided." });
  }

  try {
    let saleItems = [];
    let grandTotal = 0;

    for (const item of items) {
      const { barcode, quantity } = item;

      if (!barcode || typeof quantity !== "number" || quantity <= 0) {
        return res.status(400).json({ success: false, message: "Invalid item input." });
      }

      const medicine = await Medicine.findOne({ barcode, user: userId });
      if (!medicine) {
        return res.status(404).json({ success: false, message: `Medicine not found for barcode: ${barcode}` });
      }

      if (medicine.stock < quantity) {
        return res.status(400).json({ success: false, message: `Insufficient stock for ${medicine.brandName}` });
      }

      const batches = await StockEntry.find({
        medicine: medicine._id,
        user: userId,
        quantity: { $gt: 0 },
        expiryDate: { $gte: new Date() },
      }).sort({ expiryDate: 1 });

      let selectedBatch = null;
      for (const batch of batches) {
        if (batch.quantity >= quantity) {
          selectedBatch = batch;
          break;
        }
      }

      if (!selectedBatch) {
        return res.status(400).json({ success: false, message: `No batch with enough quantity for ${medicine.brandName}` });
      }

      selectedBatch.quantity -= quantity;
      await selectedBatch.save();

      medicine.stock -= quantity;
      await medicine.save();

      const itemTotal = medicine.salePrice * quantity;
      grandTotal += itemTotal;

      saleItems.push({
        medicine: medicine._id,
        batch: selectedBatch._id,
        quantity,
        price: medicine.salePrice,
        total: itemTotal,
      });
    }

    const sale = new Sale({
      items: saleItems,
      grandTotal,
      soldBy: userId,
      customerName: customerName || undefined,
      user: userId, // 👈 Add this
    });

    await sale.save();

    const populatedSale = await Sale.findOne({ _id: sale._id, user: userId })
      .populate("items.medicine", "brandName barcode")
      .populate("items.batch", "expiryDate")
      .populate("soldBy", "name email");

    res.status(201).json({ success: true, message: "Sale recorded successfully", sale: populatedSale });
  } catch (err) {
    console.error("💥 Error in /sell:", err);
    res.status(500).json({ success: false, error: "Internal server error" });
  }
});

// 🔒 Quick Sale
router.post("/quick-sale", fetchuser, async (req, res) => {
  const { barcode, quantity = 1, customerName } = req.body;
  const userId = req.user?.id;

  if (!barcode || quantity <= 0) {
    return res.status(400).json({ success: false, message: "Invalid barcode or quantity" });
  }

  try {
    const medicine = await Medicine.findOne({ barcode, user: userId });
    if (!medicine) return res.status(404).json({ success: false, message: "Medicine not found" });

    if (medicine.stock < quantity) {
      return res.status(400).json({ success: false, message: `Not enough stock for ${medicine.brandName}` });
    }

    const batches = await StockEntry.find({
      medicine: medicine._id,
      user: userId,
      quantity: { $gt: 0 },
      expiryDate: { $gte: new Date() },
    }).sort({ expiryDate: 1 });

    const selectedBatch = batches.find(b => b.quantity >= quantity);
    if (!selectedBatch) {
      return res.status(400).json({ success: false, message: "No batch with sufficient stock" });
    }

    selectedBatch.quantity -= quantity;
    await selectedBatch.save();

    medicine.stock -= quantity;
    await medicine.save();

    const itemTotal = medicine.salePrice * quantity;

    const sale = new Sale({
      items: [{
        medicine: medicine._id,
        batch: selectedBatch._id,
        quantity,
        price: medicine.salePrice,
        total: itemTotal,
      }],
      grandTotal: itemTotal,
      soldBy: userId,
      customerName: customerName || undefined,
      user: userId, // 👈 Add this
    });

    await sale.save();

    const populatedSale = await Sale.findOne({ _id: sale._id, user: userId })
      .populate("items.medicine", "brandName barcode")
      .populate("items.batch", "expiryDate")
      .populate("soldBy", "name email");

    return res.status(201).json({ success: true, message: "Quick sale completed", sale: populatedSale });
  } catch (err) {
    console.error("💥 Error in /quick-sale:", err);
    return res.status(500).json({ success: false, error: "Internal server error" });
  }
});

// 🔒 Get all sales of logged-in user
router.get("/all", fetchuser, async (req, res) => {
  try {
    const sales = await Sale.find({ user: req.user.id })
      .populate("items.medicine", "brandName barcode")
      .populate("items.batch", "expiryDate quantity")
      .populate("soldBy", "name email")
      .sort({ date: -1 });

    res.json({ success: true, sales });
  } catch (err) {
    console.error("💥 Error in /all:", err);
    res.status(500).json({ success: false, error: "Internal server error" });
  }
});

// 🔒 Get sale by ID
router.get("/:id", fetchuser, async (req, res) => {
  try {
    const sale = await Sale.findOne({ _id: req.params.id, user: req.user.id })
      .populate("items.medicine", "brandName barcode")
      .populate("items.batch", "expiryDate quantity")
      .populate("soldBy", "name email");

    if (!sale) {
      return res.status(404).json({ success: false, message: "Sale not found" });
    }

    res.json({ success: true, sale });
  } catch (err) {
    console.error("💥 Error in GET /:id:", err);
    res.status(500).json({ success: false, error: "Internal server error" });
  }
});

// 🔒 Update customerName only
router.put("/:id", fetchuser, async (req, res) => {
  try {
    const { customerName } = req.body;

    const sale = await Sale.findOne({ _id: req.params.id, user: req.user.id });
    if (!sale) {
      return res.status(404).json({ success: false, message: "Sale not found" });
    }

    sale.customerName = customerName || sale.customerName;
    await sale.save();

    const updatedSale = await Sale.findById(sale._id)
      .populate("items.medicine", "brandName barcode")
      .populate("items.batch", "expiryDate quantity")
      .populate("soldBy", "name email");

    res.json({ success: true, message: "Sale updated", sale: updatedSale });
  } catch (err) {
    console.error("💥 Error in PUT /:id:", err);
    res.status(500).json({ success: false, error: "Internal server error" });
  }
});

// 🔒 Delete sale by ID
router.delete("/:id", fetchuser, async (req, res) => {
  try {
    const sale = await Sale.findOne({ _id: req.params.id, user: req.user.id });
    if (!sale) {
      return res.status(404).json({ success: false, message: "Sale not found" });
    }

    await sale.deleteOne();
    res.json({ success: true, message: "Sale deleted successfully" });
  } catch (err) {
    console.error("💥 Error in DELETE /:id:", err);
    res.status(500).json({ success: false, error: "Internal server error" });
  }
});

module.exports = router;
