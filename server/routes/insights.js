const express = require('express');
const router = express.Router();
const MoodEntry = require('../models/MoodEntry');
const QuizResult = require('../models/QuizResult');
const JournalEntry = require('../models/JournalEntry');

router.get('/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const [moods, quizzes, journals] = await Promise.all([
      MoodEntry.find({ userId, date: { $gte: sevenDaysAgo } }).sort({ date: 1 }),
      QuizResult.find({ userId, date: { $gte: sevenDaysAgo } }),
      JournalEntry.find({ userId, date: { $gte: sevenDaysAgo } })
    ]);

    const insights = [];
    
    if (moods.length > 0) {
      const avgMood = moods.reduce((sum, m) => sum + m.mood, 0) / moods.length;
      const moodTrend = moods.length >= 2 
        ? (moods[moods.length - 1].mood - moods[0].mood) 
        : 0;
      
      insights.push({
        type: 'mood',
        title: 'Mood Overview',
        content: `This week you logged ${moods.length} mood entries. Your average mood was ${avgMood.toFixed(1)}/5.`,
        trend: moodTrend > 0 ? 'improving' : moodTrend < 0 ? 'declining' : 'stable',
        score: Math.round(avgMood / 5 * 100)
      });
      
      if (moodTrend > 0) {
        insights.push({
          type: 'positive',
          title: 'Great Progress!',
          content: 'Your mood has been improving over the past week. Keep up the good work!',
          score: 90
        });
      } else if (avgMood < 2.5) {
        insights.push({
          type: 'concern',
          title: 'Mood Support',
          content: 'Your mood scores have been low this week. Consider reaching out to a counsellor or trying some wellness activities.',
          score: 40
        });
      }
    } else {
      insights.push({
        type: 'reminder',
        title: 'Start Tracking',
        content: 'You haven\'t logged any moods this week. Regular tracking helps you understand your patterns better.',
        score: 50
      });
    }
    
    if (quizzes.length > 0) {
      const severeQuizzes = quizzes.filter(q => ['severe', 'high', 'very_high'].includes(q.severity));
      if (severeQuizzes.length > 0) {
        insights.push({
          type: 'alert',
          title: 'Quiz Results Check',
          content: `Your recent quizzes show elevated symptoms. Please consider speaking with a counsellor.`,
          score: 30
        });
      } else {
        insights.push({
          type: 'positive',
          title: 'Healthy Quiz Results',
          content: 'Your recent quiz results show manageable symptom levels. Keep monitoring!',
          score: 80
        });
      }
    }
    
    if (journals.length > 0) {
      const avgSentiment = journals.reduce((sum, j) => sum + (j.sentimentScore || 0.5), 0) / journals.length;
      insights.push({
        type: 'journal',
        title: 'Journal Consistency',
        content: `You've written ${journals.length} journal entries this week with an average ${(avgSentiment * 100).toFixed(0)}% positive sentiment.`,
        score: Math.round(avgSentiment * 100)
      });
    }

    const overallScore = insights.length > 0
      ? Math.round(insights.reduce((sum, i) => sum + i.score, 0) / insights.length)
      : 50;

    res.json({
      weekStart: sevenDaysAgo,
      weekEnd: new Date(),
      insights,
      overallScore,
      stats: {
        moodEntries: moods.length,
        quizzesTaken: quizzes.length,
        journalsWritten: journals.length
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;