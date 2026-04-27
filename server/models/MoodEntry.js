const mongoose = require('mongoose');

const moodEntrySchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  mood: { type: Number, required: true, min: 1, max: 5 },
  reasonTags: [{ type: String }],
  note: { type: String, default: '' },
  date: { type: Date, default: Date.now },
  streak: { type: Number, default: 0 }
});

module.exports = mongoose.model('MoodEntry', moodEntrySchema);