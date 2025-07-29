const express = require("express");
const mongoose = require("mongoose");
const router = express.Router();

const Return = require("../models/Return");
const StockEntry = require("../models/StockEntry");
const Medicine = require("../models/Medicine"); // ✅ Add this

// Add a return
router.post("/add", async (req, res) => {
  try {
    const { stockEntryId, quantity, returnType, medicine: medicineId } = req.body;

    const newReturn = new Return(req.body);
    const savedReturn = await newReturn.save();

    const stockEntry = await StockEntry.findById(stockEntryId);
    if (!stockEntry) {
      return res.status(404).json({ error: "Stock entry not found" });
    }

    // ✅ Update StockEntry & Medicine
    if (returnType === "customer") {
      stockEntry.quantity += Number(quantity);
      await Medicine.findByIdAndUpdate(medicineId, { $inc: { stock: quantity } });
    } else if (returnType === "supplier") {
      stockEntry.quantity -= Number(quantity);
      if (stockEntry.quantity < 0) stockEntry.quantity = 0;
      await Medicine.findByIdAndUpdate(medicineId, { $inc: { stock: -quantity } });
    }

    await stockEntry.save();

    res.status(201).json(savedReturn);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Get all returns
router.get("/all", async (req, res) => {
  try {
    const returns = await Return.find().populate("medicine");
    res.status(200).json(returns);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete a return
router.delete("/delete/:id", async (req, res) => {
  try {
    const returnData = await Return.findById(req.params.id);
    if (!returnData) {
      return res.status(404).json({ error: "Return not found" });
    }

    const stockEntry = await StockEntry.findById(returnData.stockEntryId);
    if (stockEntry) {
      if (returnData.returnType === "customer") {
        stockEntry.quantity -= Number(returnData.quantity);
        await Medicine.findByIdAndUpdate(returnData.medicine, { $inc: { stock: -returnData.quantity } });
      } else if (returnData.returnType === "supplier") {
        stockEntry.quantity += Number(returnData.quantity);
        await Medicine.findByIdAndUpdate(returnData.medicine, { $inc: { stock: returnData.quantity } });
      }
      if (stockEntry.quantity < 0) stockEntry.quantity = 0;
      await stockEntry.save();
    }

    await Return.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: "Return deleted" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update a return
router.put("/update/:id", async (req, res) => {
  try {
    const existingReturn = await Return.findById(req.params.id);
    if (!existingReturn) {
      return res.status(404).json({ error: "Return not found" });
    }

    // Revert old stock
    const oldStockEntry = await StockEntry.findById(existingReturn.stockEntryId);
    if (oldStockEntry) {
      if (existingReturn.returnType === "customer") {
        oldStockEntry.quantity -= Number(existingReturn.quantity);
        await Medicine.findByIdAndUpdate(existingReturn.medicine, { $inc: { stock: -existingReturn.quantity } });
      } else if (existingReturn.returnType === "supplier") {
        oldStockEntry.quantity += Number(existingReturn.quantity);
        await Medicine.findByIdAndUpdate(existingReturn.medicine, { $inc: { stock: existingReturn.quantity } });
      }
      if (oldStockEntry.quantity < 0) oldStockEntry.quantity = 0;
      await oldStockEntry.save();
    }

    // Apply new stock update
    const newStockEntry = await StockEntry.findById(req.body.stockEntryId);
    if (newStockEntry) {
      if (req.body.returnType === "customer") {
        newStockEntry.quantity += Number(req.body.quantity);
        await Medicine.findByIdAndUpdate(req.body.medicine, { $inc: { stock: req.body.quantity } });
      } else if (req.body.returnType === "supplier") {
        newStockEntry.quantity -= Number(req.body.quantity);
        if (newStockEntry.quantity < 0) newStockEntry.quantity = 0;
        await Medicine.findByIdAndUpdate(req.body.medicine, { $inc: { stock: -req.body.quantity } });
      }
      await newStockEntry.save();
    }

    const updatedReturn = await Return.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    res.status(200).json(updatedReturn);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

module.exports = router;
