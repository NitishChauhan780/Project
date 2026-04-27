const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  type: { 
    type: String, 
    enum: ['appointment', 'achievement', 'reminder', 'forum', 'system', 'message', 'announcement'],
    required: true 
  },
  title: { type: String, required: true },
  message: { type: String, required: true },
  isRead: { type: Boolean, default: false },
  readAt: { type: Date, default: null },
  metadata: {
    relatedId: { type: mongoose.Schema.Types.ObjectId, default: null },
    link: { type: String, default: null },
    icon: { type: String, default: null }
  },
  priority: { type: String, enum: ['low', 'medium', 'high'], default: 'medium' },
  createdAt: { type: Date, default: Date.now, index: true },
  expiresAt: { type: Date, default: null }
});

notificationSchema.index({ userId: 1, isRead: 1, createdAt: -1 });

notificationSchema.methods.markAsRead = function() {
  this.isRead = true;
  this.readAt = new Date();
  return this.save();
};

notificationSchema.statics.getUnreadCount = function(userId) {
  return this.countDocuments({ userId, isRead: false });
};

notificationSchema.statics.createNotification = async function(userId, type, title, message, options = {}) {
  return this.create({
    userId,
    type,
    title,
    message,
    ...options
  });
};

module.exports = mongoose.model('Notification', notificationSchema);