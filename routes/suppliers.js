const express = require("express");
const router = express.Router();
const Supplier = require("../models/Supplier");
const fetchuser = require("../middleware/fetchuser");

// 🔐 Apply fetchuser to all supplier routes
router.use(fetchuser);

// 📦 GET all suppliers for the logged-in user
router.get("/", async (req, res) => {
  try {
    const suppliers = await Supplier.find({ user: req.user.id });
    res.json({ success: true, suppliers });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ➕ ADD a new supplier for the logged-in user
router.post("/add", async (req, res) => {
  try {
    const { name, phone, email, address } = req.body;
    const supplier = new Supplier({
      name,
      phone,
      email,
      address,
      user: req.user.id, // 🔐 Link to current user
    });

    await supplier.save();
    res.json({ success: true, supplier });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ✏️ UPDATE a supplier (only if it belongs to current user)
router.put("/:id", async (req, res) => {
  try {
    const supplier = await Supplier.findOneAndUpdate(
      { _id: req.params.id, user: req.user.id },
      req.body,
      { new: true }
    );

    if (!supplier) {
      return res.status(404).json({ success: false, message: "Supplier not found" });
    }

    res.json({ success: true, supplier });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ❌ DELETE a supplier (only if it belongs to current user)
router.delete("/:id", async (req, res) => {
  try {
    const supplier = await Supplier.findOneAndDelete({
      _id: req.params.id,
      user: req.user.id,
    });

    if (!supplier) {
      return res.status(404).json({ success: false, message: "Supplier not found" });
    }

    res.json({ success: true, message: "Supplier deleted" });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
