const express = require("express");
const router = express.Router();
const { body, validationResult } = require("express-validator");
const Medicine = require("../models/Medicine");
const fetchuser = require("../middleware/fetchuser");

// ------------------------
// Validation Rules
// ------------------------
const medicineValidation = [
  body("brandName").notEmpty().withMessage("Brand name is required"),
  body("genericName").notEmpty().withMessage("Generic name is required"),
  body("strength").notEmpty().withMessage("Strength is required (e.g. '500mg')"),
  body("unit").isIn(["tablet", "strip", "bottle", "syrup"]).withMessage("Invalid unit"),
  body("manufacturer").notEmpty().withMessage("Manufacturer is required"),
  body("barcode").notEmpty().withMessage("Barcode is required"),
  body("salePrice").isFloat({ min: 0.01 }).withMessage("Sale price must be a number"),
  body("stock").isInt({ min: 0 }).withMessage("Stock must be a non-negative number"),
];

// ------------------------
// Validation Handler
// ------------------------
const handleValidation = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }
  next();
};

// ------------------------
// POST /api/medicine/add
// ------------------------
router.post("/add", fetchuser, medicineValidation, handleValidation, async (req, res) => {
  try {
    const { barcode, stock } = req.body;

    const existingMedicine = await Medicine.findOne({ barcode, user: req.user.id });

    if (existingMedicine) {
      existingMedicine.stock += parseInt(stock);
      existingMedicine.updatedAt = new Date();
      await existingMedicine.save();

      return res.json({
        success: true,
        message: "Stock updated for existing medicine",
        medicine: existingMedicine,
      });
    }

    const newMedicine = new Medicine({
      ...req.body,
      user: req.user.id,
      updatedAt: new Date(),
    });

    await newMedicine.save();
    res.json({ success: true, message: "New medicine added", medicine: newMedicine });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ------------------------
// GET /api/medicine/all
// ------------------------
router.get("/all", fetchuser, async (req, res) => {
  try {
    const medicines = await Medicine.find({ user: req.user.id }).sort({ createdAt: -1 });
    res.json({ success: true, medicines });
  } catch (err) {
    res.status(500).json({ success: false, error: "Server error" });
  }
});

// ------------------------
// PUT /api/medicine/update/:id
// ------------------------
router.put("/update/:id", fetchuser, medicineValidation, handleValidation, async (req, res) => {
  try {
    const med = await Medicine.findOne({ _id: req.params.id, user: req.user.id });
    if (!med) {
      return res.status(404).json({ success: false, message: "Medicine not found or unauthorized" });
    }

    const updated = await Medicine.findByIdAndUpdate(
      req.params.id,
      {
        ...req.body,
        updatedAt: new Date(),
      },
      { new: true }
    );

    res.json({ success: true, message: "Medicine updated", medicine: updated });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ------------------------
// DELETE /api/medicine/delete/:id
// ------------------------
router.delete("/delete/:id", fetchuser, async (req, res) => {
  try {
    const med = await Medicine.findOne({ _id: req.params.id, user: req.user.id });
    if (!med) {
      return res.status(404).json({ success: false, message: "Medicine not found or unauthorized" });
    }

    await Medicine.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: "Medicine deleted successfully" });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ------------------------
// GET /api/medicine/barcode/:code
// ------------------------
router.get("/barcode/:code", fetchuser, async (req, res) => {
  try {
    const med = await Medicine.findOne({ barcode: req.params.code, user: req.user.id });

    if (!med) {
      return res.status(404).json({ success: false, message: "Medicine not found" });
    }

    res.json({ success: true, medicine: med });
  } catch (err) {
    res.status(500).json({ success: false, error: "Server error" });
  }
});

module.exports = router;
