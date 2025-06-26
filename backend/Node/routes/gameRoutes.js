const express = require("express");
const router = express.Router();
const GameResult = require("../models/UserGameResult");

// @POST - Submit game results
router.post("/submit", async (req, res) => {
  try {
    const result = new GameResult(req.body);
    await result.save();
    res.status(201).json({ message: "Game result saved!" });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// @GET - Fetch all results
router.get("/results", async (req, res) => {
  try {
    const results = await GameResult.find();
    res.json(results);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// @GET - Fetch by user name
router.get("/result/:name", async (req, res) => {
  try {
    const result = await GameResult.findOne({ name: req.params.name });
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
