const mongoose = require('mongoose');

const quizResultSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  quizType: { type: String, enum: ['PHQ-9', 'GAD-7', 'PSS-10', 'ISI', 'GHQ-12'], required: true },
  score: { type: Number, required: true },
  severity: { type: String, enum: ['minimal', 'mild', 'moderate', 'severe', 'extremely_severe', 'low', 'high', 'very_high', 'none', 'subthreshold', 'good', 'fair', 'poor', 'concern', 'critical'], required: true },
  answers: [{ type: Number }],
  date: { type: Date, default: Date.now }
});

module.exports = mongoose.model('QuizResult', quizResultSchema);