const express = require("express");
const router = express.Router();
const GameResult = require("../models/UserGameResult"); // Adjust path

router.post("/finalResult", async (req, res) => {
  try {
    const newResult = new GameResult(req.body);
    await newResult.save();
    res.status(201).json({ message: "Game result saved successfully" });
  } catch (err) {
    console.error("Error saving result:", err);
    res.status(500).json({ message: "Failed to save game result" });
  }
});

module.exports = router;
