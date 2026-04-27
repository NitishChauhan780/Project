const express = require("express");
const router = express.Router();
const QuizResult = require("../models/QuizResult");
const MoodEntry = require("../models/MoodEntry");
const JournalEntry = require("../models/JournalEntry");
const Notification = require("../models/Notification");
const User = require("../models/User");

async function notifyAtRiskStudent(userId) {
  const last24Hours = new Date(Date.now() - 24 * 60 * 60 * 1000);
  const existing = await Notification.findOne({
    userId,
    type: "system",
    title: "Wellness Check-In Recommended",
    createdAt: { $gte: last24Hours },
  });

  if (!existing) {
    await Notification.createNotification(
      userId,
      "system",
      "Wellness Check-In Recommended",
      "We noticed signs you may need extra support. Please check your resources, use MindBot, or contact your counselor.",
      {
        priority: "high",
        metadata: { link: "/resources", icon: "alert" },
      },
    );
  }
}

router.get("/at-risk", async (req, res) => {
  try {
    const atRiskStudents = [];

    const severeQuizzes = await QuizResult.find({
      $or: [
        { quizType: "PHQ-9", score: { $gte: 20 } },
        { quizType: "GAD-7", score: { $gte: 15 } },
        { quizType: "PSS-10", score: { $gte: 30 } },
      ],
    })
      .populate("userId", "name email department yearOfStudy program section")
      .sort({ score: -1 });

    for (const quiz of severeQuizzes) {
      if (quiz.userId) {
        await notifyAtRiskStudent(quiz.userId._id);
        atRiskStudents.push({
          studentId: quiz.userId._id,
          studentName: quiz.userId.name,
          studentEmail: quiz.userId.email,
          department: quiz.userId.department,
          yearOfStudy: quiz.userId.yearOfStudy,
          program: quiz.userId.program,
          section: quiz.userId.section,
          type: "severe_quiz",
          quizType: quiz.quizType,
          score: quiz.score,
          severity: quiz.severity,
          date: quiz.date,
          priority:
            quiz.quizType === "PHQ-9" && quiz.score >= 20 ? "high" : "medium",
        });
      }
    }

    const lowMoodUsers = await MoodEntry.aggregate([
      {
        $group: {
          _id: "$userId",
          avgMood: { $avg: "$mood" },
          recentMoods: { $push: "$mood" },
          count: { $sum: 1 },
        },
      },
      { $match: { avgMood: { $lt: 2 }, count: { $gte: 3 } } },
    ]);

    for (const entry of lowMoodUsers) {
      await notifyAtRiskStudent(entry._id);
      const userDoc = await User.findById(entry._id).select("name email department yearOfStudy program section");
      if (userDoc) {
        atRiskStudents.push({
          studentId: entry._id,
          studentName: userDoc.name,
          studentEmail: userDoc.email,
          department: userDoc.department,
          yearOfStudy: userDoc.yearOfStudy,
          program: userDoc.program,
          section: userDoc.section,
          type: "low_mood",
          avgMood: entry.avgMood.toFixed(1),
          recentMoods: entry.recentMoods.slice(0, 7),
          priority: entry.avgMood < 1.5 ? "high" : "medium",
        });
      }
    }

    const crisisJournals = await JournalEntry.find({
      $or: [
        { content: { $regex: /suicide|kill myself|end it all|self harm/i } },
        { sentiment: "negative", sentimentScore: { $lt: 0.2 } },
      ],
    })
      .populate("userId", "name email department yearOfStudy program section")
      .sort({ date: -1 });

    for (const journal of crisisJournals) {
      if (journal.userId) {
        await notifyAtRiskStudent(journal.userId._id);
        atRiskStudents.push({
          studentId: journal.userId._id,
          studentName: journal.userId.name,
          studentEmail: journal.userId.email,
          department: journal.userId.department,
          yearOfStudy: journal.userId.yearOfStudy,
          program: journal.userId.program,
          section: journal.userId.section,
          type: "crisis_journal",
          content: journal.content.substring(0, 100),
          sentiment: journal.sentiment,
          date: journal.date,
          priority: "high",
        });
      }
    }

    const sorted = atRiskStudents.sort((a, b) => {
      if (a.priority === "high" && b.priority !== "high") return -1;
      if (b.priority === "high" && a.priority !== "high") return 1;
      return 0;
    });

    res.json(sorted);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
