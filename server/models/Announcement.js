const mongoose = require('mongoose');

const announcementSchema = new mongoose.Schema({
  title: { type: String, required: true },
  content: { type: String, required: true },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  createdAt: { type: Date, default: Date.now },
  isActive: { type: Boolean, default: true },
  priority: { type: String, enum: ['normal', 'high'], default: 'normal' },
  targetDepartment: { type: String, default: '' },
  targetYear: { type: String, default: '' }
});

module.exports = mongoose.model('Announcement', announcementSchema);