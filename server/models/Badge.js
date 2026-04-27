const mongoose = require('mongoose');

const badgeSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  description: { type: String, required: true },
  icon: { type: String, required: true },
  category: { type: String, enum: ['mood', 'quiz', 'journal', 'streak', 'social', 'wellness'], required: true },
  requirement: {
    type: { type: String, required: true },
    value: { type: Number, required: true }
  },
  rarity: { type: String, enum: ['common', 'rare', 'epic', 'legendary'], default: 'common' },
  points: { type: Number, default: 10 }
});

badgeSchema.statics.checkAndAward = async function(userId) {
  const User = mongoose.model('User');
  const MoodEntry = mongoose.model('MoodEntry');
  const QuizResult = mongoose.model('QuizResult');
  const JournalEntry = mongoose.model('JournalEntry');

  const user = await User.findById(userId);
  if (!user.badges) user.badges = [];

  const allBadges = await this.find();
  const newlyEarned = [];

  for (const badge of allBadges) {
    if (user.badges.includes(badge.name)) continue;

    let earned = false;
    const requirement = badge.requirement;

    switch (requirement.type) {
      case 'mood_entries':
        const moodCount = await MoodEntry.countDocuments({ userId });
        earned = moodCount >= requirement.value;
        break;
      case 'streak':
        const lastMood = await MoodEntry.findOne({ userId }).sort({ date: -1 });
        earned = lastMood && lastMood.streak >= requirement.value;
        break;
      case 'quiz_count':
        const quizCount = await QuizResult.countDocuments({ userId });
        earned = quizCount >= requirement.value;
        break;
      case 'journal_count':
        const journalCount = await JournalEntry.countDocuments({ userId });
        earned = journalCount >= requirement.value;
        break;
      case 'quiz_severity':
        const lowSeverityQuiz = await QuizResult.findOne({ 
          userId, 
          severity: { $in: ['minimal', 'mild'] } 
        });
        earned = !!lowSeverityQuiz;
        break;
    }

    if (earned) {
      user.badges.push(badge.name);
      user.points = (user.points || 0) + badge.points;
      newlyEarned.push(badge);
    }
  }

  if (newlyEarned.length > 0) {
    await user.save();
  }

  return { newlyEarned, totalPoints: user.points };
};

module.exports = mongoose.model('Badge', badgeSchema);