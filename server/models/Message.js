const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  appointmentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Appointment', required: true, index: true },
  senderId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  senderRole: { type: String, enum: ['counsellor', 'student'], required: true },
  content: { type: String, required: true, maxlength: 2000 },
  isRead: { type: Boolean, default: false },
  readAt: { type: Date },
  createdAt: { type: Date, default: Date.now }
});

messageSchema.index({ appointmentId: 1, createdAt: 1 });
messageSchema.index({ senderId: 1, isRead: 1 });

messageSchema.statics.getConversation = async function(appointmentId) {
  return this.find({ appointmentId })
    .sort({ createdAt: 1 })
    .populate('senderId', 'name role');
};

messageSchema.statics.getUnreadByRole = async function(userId, role) {
  return this.find({
    senderId: { $ne: userId },
    senderRole: role === 'counsellor' ? 'student' : 'counsellor',
    isRead: false
  }).populate('appointmentId').populate('senderId', 'name');
};

messageSchema.statics.markConversationRead = async function(appointmentId, userId) {
  return this.updateMany(
    { appointmentId, senderId: { $ne: userId }, isRead: false },
    { $set: { isRead: true, readAt: new Date() } }
  );
};

module.exports = mongoose.model('Message', messageSchema);