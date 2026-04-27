const mongoose = require('mongoose');

const chatHistorySchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  messages: [{
    role: { type: String, enum: ['user', 'assistant'], required: true },
    content: { type: String, required: true },
    timestamp: { type: Date, default: Date.now }
  }],
  lastUpdated: { type: Date, default: Date.now }
});

chatHistorySchema.pre('save', function(next) {
  this.lastUpdated = new Date();
  next();
});

chatHistorySchema.statics.addMessage = async function(userId, role, content) {
  let history = await this.findOne({ userId });
  if (!history) {
    history = new this({ userId, messages: [] });
  }
  history.messages.push({ role, content, timestamp: new Date() });
  await history.save();
  return history;
};

chatHistorySchema.statics.getHistory = async function(userId, limit = 50) {
  const history = await this.findOne({ userId });
  if (!history) return [];
  return history.messages.slice(-limit);
};

chatHistorySchema.statics.clearHistory = async function(userId) {
  await this.deleteOne({ userId });
};

module.exports = mongoose.model('ChatHistory', chatHistorySchema);