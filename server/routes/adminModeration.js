const express = require("express");
const router = express.Router();
const ForumPost = require("../models/ForumPost");
const ModerationLog = require("../models/ModerationLog");
const Notification = require("../models/Notification");

router.get("/posts", async (req, res) => {
  try {
    const { queue = "all" } = req.query;
    const query = {};
    if (queue === "reported") {
      query.reported = true;
    } else if (queue === "pending") {
      query.moderationStatus = "pending_review";
    } else if (queue === "pinned") {
      query.isPinned = true;
    }

    const posts = await ForumPost.find(query)
      .populate("authorId", "name email")
      .sort({ date: -1 })
      .limit(100);
    res.json(posts);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete("/posts/:id", async (req, res) => {
  try {
    const { adminId, reason } = req.body || {};
    const post = await ForumPost.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ error: "Post not found" });
    }

    await Notification.createNotification(
      post.authorId,
      "forum",
      "Your Post Was Removed",
      reason
        ? `A moderator removed your forum post. Reason: ${reason}`
        : "A moderator removed your forum post for community safety.",
      { priority: "high", metadata: { link: "/forum" } },
    );

    await ModerationLog.create({
      postId: post._id,
      postAuthorId: post.authorId,
      moderatorId: adminId || null,
      action: "delete",
      reason: reason || "Policy violation",
    });

    await ForumPost.findByIdAndDelete(req.params.id);
    res.json({ message: "Post deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put("/posts/:id/pin", async (req, res) => {
  try {
    const { adminId, reason } = req.body || {};
    const post = await ForumPost.findByIdAndUpdate(
      req.params.id,
      {
        isPinned: true,
        moderatedBy: adminId || null,
        moderatedAt: new Date(),
        moderationReason: reason || "Pinned by moderator",
      },
      { new: true },
    );

    if (post) {
      await Notification.createNotification(
        post.authorId,
        "forum",
        "Your Post Was Pinned",
        "A moderator pinned your post because it is helpful for the community.",
        { priority: "medium", metadata: { link: "/forum" } },
      );

      await ModerationLog.create({
        postId: post._id,
        postAuthorId: post.authorId,
        moderatorId: adminId || null,
        action: "pin",
        reason: reason || "Helpful content",
      });
    }

    res.json(post);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put("/posts/:id/unpin", async (req, res) => {
  try {
    const { adminId, reason } = req.body || {};
    const post = await ForumPost.findByIdAndUpdate(
      req.params.id,
      {
        isPinned: false,
        moderatedBy: adminId || null,
        moderatedAt: new Date(),
        moderationReason: reason || "Unpinned by moderator",
      },
      { new: true },
    );

    if (post) {
      await ModerationLog.create({
        postId: post._id,
        postAuthorId: post.authorId,
        moderatorId: adminId || null,
        action: "unpin",
        reason: reason || "Unpinned",
      });
    }

    res.json(post);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put("/posts/:id/mark-safe", async (req, res) => {
  try {
    const { adminId, reason } = req.body || {};
    const post = await ForumPost.findByIdAndUpdate(
      req.params.id,
      {
        reported: false,
        moderationStatus: "approved",
        moderatedBy: adminId || null,
        moderatedAt: new Date(),
        moderationReason: reason || "Reviewed and marked safe",
      },
      { new: true },
    );

    if (!post) {
      return res.status(404).json({ error: "Post not found" });
    }

    await ModerationLog.create({
      postId: post._id,
      postAuthorId: post.authorId,
      moderatorId: adminId || null,
      action: "mark_safe",
      reason: reason || "Reviewed and safe",
    });

    res.json(post);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/logs", async (req, res) => {
  try {
    const logs = await ModerationLog.find()
      .populate("postAuthorId", "name email")
      .populate("moderatorId", "name email")
      .sort({ createdAt: -1 })
      .limit(100);
    res.json(logs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
