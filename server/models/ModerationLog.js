const mongoose = require("mongoose");

const moderationLogSchema = new mongoose.Schema({
  postId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "ForumPost",
    required: true,
    index: true,
  },
  postAuthorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    default: null,
  },
  moderatorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    default: null,
  },
  action: {
    type: String,
    enum: ["report", "pin", "unpin", "delete", "mark_safe"],
    required: true,
    index: true,
  },
  reason: { type: String, default: "" },
  details: { type: String, default: "" },
  metadata: { type: Object, default: {} },
  createdAt: { type: Date, default: Date.now, index: true },
});

module.exports = mongoose.model("ModerationLog", moderationLogSchema);
