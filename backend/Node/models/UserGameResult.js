const mongoose = require("mongoose");

const GameResultSchema = new mongoose.Schema({
  // Player info
  name: String,
  age: Number,

  // Bubble Bay
  bubblebay_accuracy: Number,
  bubblebay_time: Number,
  bubblebay_score: Number,

  // Word Reef
  wordreef_accuracy: Number,
  wordreef_time: Number,
  wordreef_score: Number,
  wordreef_totalHintsUsed: Number,

  // Memory Cove
  memorycove_maxSequenceReached: Number,
  memorycove_completedAllLevels: Boolean,
  memorycove_time: Number,

  // Spell Shore
  spellshore_accuracy: Number,
  spellshore_time: Number,
  spellshore_score: Number,
  spellshore_fallback_accuracy: Number,
  spellshore_fallback_time: Number,

  // Sentence Sea
  sentencesea_accuracy: Number,
  sentencesea_time: Number,
  sentencesea_score: Number,
  sentencesea_totalHintsUsed: Number,
  sentencesea_fallback_accuracy: Number,
  sentencesea_fallback_time: Number,

  // Summary
  total_game_time: Number,
  total_hints: Number,

  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("UserGameResult", GameResultSchema);
