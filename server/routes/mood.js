const express = require('express');
const router = express.Router();
const MoodEntry = require('../models/MoodEntry');

router.get('/:userId', async (req, res) => {
  try {
    const entries = await MoodEntry.find({ userId: req.params.userId })
      .sort({ date: -1 })
      .limit(30);
    res.json(entries);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const { userId, mood, reasonTags, note } = req.body;
    
    const lastEntry = await MoodEntry.findOne({ userId }).sort({ date: -1 });
    let streak = 1;
    
    if (lastEntry) {
      const lastDate = new Date(lastEntry.date);
      const today = new Date();
      const diffDays = Math.floor((today - lastDate) / (1000 * 60 * 60 * 24));
      
      if (diffDays === 1 && lastEntry.mood >= 3) {
        streak = lastEntry.streak + 1;
      }
    }
    
    const entry = new MoodEntry({ userId, mood, reasonTags, note, streak });
    await entry.save();
    res.status(201).json(entry);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/streak/:userId', async (req, res) => {
  try {
    const lastEntry = await MoodEntry.findOne({ userId: req.params.userId })
      .sort({ date: -1 });
    res.json({ streak: lastEntry ? lastEntry.streak : 0 });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;