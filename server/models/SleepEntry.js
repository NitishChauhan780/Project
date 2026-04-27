const mongoose = require('mongoose');

const sleepEntrySchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  date: { type: Date, required: true, index: true },
  bedtime: { type: Date, required: true },
  wakeTime: { type: Date, required: true },
  sleepDuration: { type: Number, required: true },
  quality: { type: Number, min: 1, max: 5, required: true },
  notes: { type: String, default: '' },
  dreamRecall: { type: Boolean, default: false },
  interruptions: { type: Number, default: 0 },
  feeling: { type: String, enum: ['refreshed', 'tired', 'exhausted'], default: 'tired' },
  createdAt: { type: Date, default: Date.now }
});

sleepEntrySchema.index({ userId: 1, date: -1 });

sleepEntrySchema.statics.getWeeklyStats = async function(userId) {
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  sevenDaysAgo.setHours(0, 0, 0, 0);

  const entries = await this.find({
    userId,
    date: { $gte: sevenDaysAgo }
  }).sort({ date: -1 });

  if (entries.length === 0) return null;

  const avgDuration = entries.reduce((sum, e) => sum + e.sleepDuration, 0) / entries.length;
  const avgQuality = entries.reduce((sum, e) => sum + e.quality, 0) / entries.length;
  const bestNight = entries.reduce((best, e) => e.quality > best.quality ? e : best, entries[0]);

  return {
    entries,
    avgDuration: avgDuration.toFixed(1),
    avgQuality: avgQuality.toFixed(1),
    totalNights: entries.length,
    bestNight: { date: bestNight.date, quality: bestNight.quality }
  };
};

sleepEntrySchema.statics.getCorrelation = async function(userId) {
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const sleepEntries = await this.find({
    userId,
    date: { $gte: thirtyDaysAgo }
  }).sort({ date: 1 });

  if (sleepEntries.length < 3) return null;

  const MoodEntry = mongoose.model('MoodEntry');
  const correlations = [];

  for (let i = 0; i < sleepEntries.length - 1; i++) {
    const sleepEntry = sleepEntries[i];
    const nextDay = new Date(sleepEntry.date);
    nextDay.setDate(nextDay.getDate() + 1);

    const moodEntry = await MoodEntry.findOne({
      userId,
      date: { $gte: nextDay, $lt: new Date(nextDay.getTime() + 24 * 60 * 60 * 1000) }
    });

    if (moodEntry) {
      correlations.push({
        sleepQuality: sleepEntry.quality,
        sleepDuration: sleepEntry.sleepDuration,
        nextDayMood: moodEntry.mood,
        date: sleepEntry.date
      });
    }
  }

  return correlations;
};

module.exports = mongoose.model('SleepEntry', sleepEntrySchema);