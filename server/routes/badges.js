const express = require('express');
const router = express.Router();
const Badge = require('../models/Badge');
const User = require('../models/User');

router.get('/', async (req, res) => {
  try {
    const badges = await Badge.find().sort({ rarity: -1, points: -1 });
    res.json(badges);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/user/:userId', async (req, res) => {
  try {
    const user = await User.findById(req.params.userId).select('badges points');
    const allBadges = await Badge.find();

    const userBadges = allBadges.filter(b => user.badges?.includes(b.name));
    const unearnedBadges = allBadges.filter(b => !user.badges?.includes(b.name));

    res.json({
      earned: userBadges,
      unearned: unearnedBadges,
      totalPoints: user.points || 0,
      badgeCount: userBadges.length
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/check/:userId', async (req, res) => {
  try {
    const result = await Badge.checkAndAward(req.params.userId);

    if (result.newlyEarned.length > 0) {
      const Notification = require('../models/Notification');
      await Notification.createNotification(
        req.params.userId,
        'achievement',
        'New Badge Earned!',
        `You earned: ${result.newlyEarned.map(b => b.icon + ' ' + b.name).join(', ')}`,
        { priority: 'medium' }
      );
    }

    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/seed', async (req, res) => {
  try {
    const badges = [
      { name: 'First Step', description: 'Log your first mood entry', icon: '🎯', category: 'mood', requirement: { type: 'mood_entries', value: 1 }, rarity: 'common', points: 10 },
      { name: 'Week Warrior', description: 'Maintain a 7-day mood streak', icon: '🔥', category: 'streak', requirement: { type: 'streak', value: 7 }, rarity: 'rare', points: 50 },
      { name: 'Month Master', description: 'Maintain a 30-day mood streak', icon: '🏆', category: 'streak', requirement: { type: 'streak', value: 30 }, rarity: 'legendary', points: 200 },
      { name: 'Quiz Starter', description: 'Complete your first quiz', icon: '📋', category: 'quiz', requirement: { type: 'quiz_count', value: 1 }, rarity: 'common', points: 10 },
      { name: 'Quiz Explorer', description: 'Complete 5 quizzes', icon: '📊', category: 'quiz', requirement: { type: 'quiz_count', value: 5 }, rarity: 'rare', points: 50 },
      { name: 'Mindful Journal', description: 'Write your first journal entry', icon: '📝', category: 'journal', requirement: { type: 'journal_count', value: 1 }, rarity: 'common', points: 10 },
      { name: 'Journal Keeper', description: 'Write 10 journal entries', icon: '📖', category: 'journal', requirement: { type: 'journal_count', value: 10 }, rarity: 'rare', points: 50 },
      { name: 'Self-Aware', description: 'Score minimal symptoms on any quiz', icon: '💪', category: 'quiz', requirement: { type: 'quiz_severity', value: 1 }, rarity: 'epic', points: 100 },
      { name: 'Mood Tracker', description: 'Log 30 mood entries', icon: '📈', category: 'mood', requirement: { type: 'mood_entries', value: 30 }, rarity: 'epic', points: 100 },
      { name: 'Dedicated', description: 'Maintain a 14-day mood streak', icon: '⭐', category: 'streak', requirement: { type: 'streak', value: 14 }, rarity: 'epic', points: 100 }
    ];

    for (const badge of badges) {
      await Badge.findOneAndUpdate({ name: badge.name }, badge, { upsert: true });
    }

    res.json({ message: 'Badges seeded successfully', count: badges.length });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;