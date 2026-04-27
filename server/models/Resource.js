const mongoose = require('mongoose');

const resourceSchema = new mongoose.Schema({
  title: { type: String, required: true },
  content: { type: String, required: true },
  body: { type: String, default: '' },
  language: { type: String, enum: ['en', 'hi', 'both'], default: 'both' },
  category: { type: String, enum: ['article', 'video', 'exercise'], default: 'article' },
  tags: [{ type: String }],
  imageUrl: { type: String, default: '' },
  videoUrl: { type: String, default: '' },
  readTime: { type: Number, default: 5 },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Resource', resourceSchema);