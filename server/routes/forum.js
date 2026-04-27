const express = require("express");
const router = express.Router();
const ForumPost = require("../models/ForumPost");
const ModerationLog = require("../models/ModerationLog");

// Get all posts (Protect middleware already applied in server.js)
router.get("/posts", async (req, res) => {
  try {
    const { category, search, authorId } = req.query;
    let query = { reported: false };

    if (category && category !== "all") {
      query.category = category;
    }

    if (search) {
      query.$or = [
        { content: { $regex: search, $options: "i" } },
        { authorName: { $regex: search, $options: "i" } },
      ];
    }

    if (authorId) {
      query.authorId = authorId;
    }

    const posts = await ForumPost.find(query)
      .sort({ isPinned: -1, date: -1 })
      .limit(50);
    res.json(posts);
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

// Create new post
router.post("/posts", async (req, res) => {
  try {
    const { isAnonymous, content, category } = req.body;
    const authorId = req.user.id;
    const authorName = req.user.name;

    if (!content) {
      return res.status(400).json({ error: "Content is required" });
    }

    const moderationPrompt = `Analyze this forum post and respond with ONLY valid JSON:
{
  "isToxic": boolean,
  "isCrisis": boolean,
  "isSpam": boolean,
  "isAppropriate": boolean,
  "reason": "brief explanation"
}
Post: "${content}"`;

    const modResponse = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: moderationPrompt }] }],
          generationConfig: { temperature: 0.1, maxOutputTokens: 256 },
        }),
      },
    );

    const modData = await modResponse.json();
    let isCrisis = false;
    let aiReason = "";

    try {
      if (
        modData.candidates &&
        modData.candidates[0]?.content?.parts?.[0]?.text
      ) {
        const text = modData.candidates[0].content.parts[0].text;
        const cleanText = text
          .replace(/```json\n?/g, "")
          .replace(/```\n?/g, "")
          .trim();
        const modResult = JSON.parse(cleanText);
        isCrisis = modResult.isCrisis;
        if (
          modResult.isToxic ||
          modResult.isSpam ||
          modResult.isCrisis ||
          modResult.isAppropriate === false
        ) {
          aiReason =
            modResult.reason || "AI flagged content for moderation review";
        }
      }
    } catch (parseErr) {
      console.log("Moderation analysis parse failed");
    }

    const post = new ForumPost({
      authorId,
      isAnonymous,
      authorName: isAnonymous ? "Anonymous" : authorName,
      content,
      crisisAlert: isCrisis,
      category: category || "general",
      reported: Boolean(aiReason),
      moderationStatus: aiReason ? "pending_review" : "approved",
      reports: aiReason
        ? [
            {
              reason: isCrisis ? "self-harm" : "other",
              details: aiReason,
              source: "ai",
            },
          ]
        : [],
    });

    await post.save();
    res.status(201).json(post);
  } catch (err) {
    res.status(500).json({ error: "Failed to create post" });
  }
});

// Report post
router.post("/report/:postId", async (req, res) => {
  try {
    const { reason, details } = req.body;
    const reporterId = req.user.id;
    
    const allowedReasons = [
      "spam",
      "harassment",
      "hate",
      "self-harm",
      "misinformation",
      "other",
    ];
    const normalizedReason = allowedReasons.includes(reason) ? reason : "other";

    const post = await ForumPost.findById(req.params.postId);
    if (!post) {
      return res.status(404).json({ error: "Post not found" });
    }

    post.reported = true;
    post.moderationStatus = "pending_review";
    post.reports.push({
      reportedBy: reporterId,
      reason: normalizedReason,
      details: details || "",
      source: "user",
    });
    await post.save();

    await ModerationLog.create({
      postId: post._id,
      postAuthorId: post.authorId,
      moderatorId: reporterId,
      action: "report",
      reason: normalizedReason,
      details: details || "",
    });

    res.json({ message: "Post reported successfully" });
  } catch (err) {
    res.status(500).json({ error: "Report failed" });
  }
});

// Reply to post
router.post("/reply/:postId", async (req, res) => {
  try {
    const { isAnonymous, content } = req.body;
    const authorId = req.user.id;
    const authorName = req.user.name;

    if (!content) return res.status(400).json({ error: "Content is required" });

    const post = await ForumPost.findById(req.params.postId);
    if (!post) return res.status(404).json({ error: "Post not found" });

    post.replies.push({
      authorId,
      isAnonymous,
      authorName: isAnonymous ? "Anonymous" : authorName,
      content,
    });

    await post.save();
    res.json(post);
  } catch (err) {
    res.status(500).json({ error: "Reply failed" });
  }
});

// Upvote post
router.put("/upvote/:postId", async (req, res) => {
  try {
    const post = await ForumPost.findByIdAndUpdate(
      req.params.postId,
      { $inc: { upvotes: 1 } },
      { new: true },
    );
    res.json(post);
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;

module.exports = router;
