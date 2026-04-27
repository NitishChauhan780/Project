const express = require('express');
const router = express.Router();
const SleepEntry = require('../models/SleepEntry');
const MoodEntry = require('../models/MoodEntry');

router.get('/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const { days = 30 } = req.query;
    
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(days));
    startDate.setHours(0, 0, 0, 0);

    const entries = await SleepEntry.find({
      userId,
      date: { $gte: startDate }
    }).sort({ date: -1 });

    res.json(entries);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const { userId, date, bedtime, wakeTime, quality, notes, dreamRecall, interruptions, feeling } = req.body;

    if (!userId || !date || !bedtime || !wakeTime || !quality) {
      return res.status(400).json({ error: 'userId, date, bedtime, wakeTime, and quality are required' });
    }

    const bedtimeDate = new Date(bedtime);
    const wakeTimeDate = new Date(wakeTime);
    
    let sleepDuration = (wakeTimeDate - bedtimeDate) / (1000 * 60 * 60);
    if (sleepDuration < 0) {
      sleepDuration += 24;
    }

    const entry = new SleepEntry({
      userId,
      date: new Date(date),
      bedtime: bedtimeDate,
      wakeTime: wakeTimeDate,
      sleepDuration: Math.round(sleepDuration * 10) / 10,
      quality,
      notes,
      dreamRecall,
      interruptions,
      feeling
    });

    await entry.save();
    res.status(201).json(entry);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/:userId/stats', async (req, res) => {
  try {
    const { userId } = req.params;
    const stats = await SleepEntry.getWeeklyStats(userId);
    res.json(stats || { message: 'No sleep data yet' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/:userId/correlation', async (req, res) => {
  try {
    const { userId } = req.params;
    const correlation = await SleepEntry.getCorrelation(userId);
    res.json(correlation || { message: 'Not enough data for correlation analysis' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/:entryId', async (req, res) => {
  try {
    const entry = await SleepEntry.findByIdAndDelete(req.params.entryId);
    if (!entry) {
      return res.status(404).json({ error: 'Sleep entry not found' });
    }
    res.json({ message: 'Sleep entry deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;