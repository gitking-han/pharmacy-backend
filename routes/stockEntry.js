const express = require("express");
const router = express.Router();
const fetchuser = require("../middleware/fetchuser"); // ✅ import fetchuser
const { createStockEntry } = require("../controllers/stockEntryController.js");
const { getAllStockEntries } = require("../controllers/stockController.js");
const { deleteStockEntry } = require("../controllers/deleteStockEntry.js");
const { updateStockEntry } = require("../controllers/updateStockEntry.js");

// ✅ Add fetchuser middleware here
router.post("/add", fetchuser, createStockEntry);
router.get("/all", fetchuser, getAllStockEntries);
router.delete("/delete/:id", fetchuser, deleteStockEntry);
router.put("/update/:id", fetchuser, updateStockEntry);

module.exports = router;
