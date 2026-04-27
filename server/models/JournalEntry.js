const mongoose = require('mongoose');

const journalEntrySchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  content: { type: String, required: true },
  sentiment: { type: String, enum: ['positive', 'neutral', 'negative'], default: 'neutral' },
  sentimentScore: { type: Number, default: 0 },
  emotions: [{ type: String }],
  insight: { type: String, default: '' },
  date: { type: Date, default: Date.now }
});

module.exports = mongoose.model('JournalEntry', journalEntrySchema);