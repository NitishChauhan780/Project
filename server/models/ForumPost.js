const mongoose = require("mongoose");

const replySchema = new mongoose.Schema({
  authorId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  isAnonymous: { type: Boolean, default: false },
  authorName: { type: String, default: "Anonymous" },
  content: { type: String, required: true },
  upvotes: { type: Number, default: 0 },
  date: { type: Date, default: Date.now },
});

const forumPostSchema = new mongoose.Schema({
  authorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  authorName: { type: String, required: true },
  content: { type: String, required: true },
  category: {
    type: String,
    enum: [
      "general",
      "academics",
      "placements",
      "projects",
      "exam-stress",
      "relationships",
      "sleep",
      "career",
      "family",
      "self-care",
      "mindfulness",
    ],
    default: "general",
  },
  isAnonymous: { type: Boolean, default: false },
  isPinned: { type: Boolean, default: false },
  reported: { type: Boolean, default: false },
  reports: [
    {
      reportedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        default: null,
      },
      reason: {
        type: String,
        enum: [
          "spam",
          "harassment",
          "hate",
          "self-harm",
          "misinformation",
          "other",
        ],
        default: "other",
      },
      details: { type: String, default: "" },
      source: { type: String, enum: ["user", "ai", "admin"], default: "user" },
      createdAt: { type: Date, default: Date.now },
    },
  ],
  moderationStatus: {
    type: String,
    enum: ["approved", "pending_review", "removed"],
    default: "approved",
  },
  moderatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    default: null,
  },
  moderatedAt: { type: Date, default: null },
  moderationReason: { type: String, default: "" },
  upvotes: { type: Number, default: 0 },
  replies: [
    {
      authorId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      authorName: String,
      isAnonymous: Boolean,
      content: String,
      upvotes: { type: Number, default: 0 },
      createdAt: { type: Date, default: Date.now },
    },
  ],
  crisisAlert: { type: Boolean, default: false },
  date: { type: Date, default: Date.now },
});

module.exports = mongoose.model("ForumPost", forumPostSchema);
