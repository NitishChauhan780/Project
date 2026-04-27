const express = require('express');
const router = express.Router();
const MoodEntry = require('../models/MoodEntry');
const QuizResult = require('../models/QuizResult');
const User = require('../models/User');
const Appointment = require('../models/Appointment');
const ForumPost = require('../models/ForumPost');

router.get('/stats', async (req, res) => {
  try {
    const days = parseInt(req.query.days) || 7;
    const { department, yearOfStudy } = req.query;
    console.log('Admin Stats Request:', { days, department, yearOfStudy });

    const totalUsers = await User.countDocuments();
    
    const userQuery = { role: 'student' };
    if (department) userQuery.department = department;
    if (yearOfStudy) userQuery.yearOfStudy = yearOfStudy;
    
    const totalStudents = await User.countDocuments(userQuery);
    const totalCounsellors = await User.countDocuments({ role: 'counsellor' });

    let filteredUserIds = null;
    if (department || yearOfStudy) {
      const students = await User.find(userQuery).select('_id');
      filteredUserIds = students.map(s => s._id);
      console.log(`Found ${filteredUserIds.length} students matching filters`);
    }
    
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    
    const moodQuery = { date: { $gte: startDate } };
    if (filteredUserIds) moodQuery.userId = { $in: filteredUserIds };
    
    const recentMoodEntries = await MoodEntry.find(moodQuery);
    const avgMood = recentMoodEntries.length > 0 
      ? (recentMoodEntries.reduce((sum, e) => sum + e.mood, 0) / recentMoodEntries.length).toFixed(2)
      : 0;
    
    const moodDistribution = {
      excellent: recentMoodEntries.filter(e => e.mood === 5).length,
      good: recentMoodEntries.filter(e => e.mood === 4).length,
      neutral: recentMoodEntries.filter(e => e.mood === 3).length,
      low: recentMoodEntries.filter(e => e.mood === 2).length,
      poor: recentMoodEntries.filter(e => e.mood === 1).length
    };
    
    const quizQuery = { date: { $gte: startDate } };
    if (filteredUserIds) quizQuery.userId = { $in: filteredUserIds };
    const recentQuizzes = await QuizResult.find(quizQuery).populate('userId', 'name email department yearOfStudy');
    const quizStats = {
      PHQ9: recentQuizzes.filter(q => q.quizType === 'PHQ-9').length,
      GAD7: recentQuizzes.filter(q => q.quizType === 'GAD-7').length,
      PSS10: recentQuizzes.filter(q => q.quizType === 'PSS-10').length,
      ISI: recentQuizzes.filter(q => q.quizType === 'ISI').length,
      GHQ12: recentQuizzes.filter(q => q.quizType === 'GHQ-12').length
    };
    
    const severityCounts = {};
    recentQuizzes.forEach(q => {
      severityCounts[q.severity] = (severityCounts[q.severity] || 0) + 1;
    });



    
    const pendingAppointments = await Appointment.countDocuments({ status: 'pending', date: { $gte: startDate } });
    const confirmedAppointments = await Appointment.countDocuments({ status: 'confirmed', date: { $gte: startDate } });

    // 2. Counsellor Utilization (Assume 15 slots per week per counsellor)
    const capacity = Math.max(1, totalCounsellors * 15 * (days / 7));
    const utilization = {
      booked: confirmedAppointments,
      capacity: Math.round(capacity),
      pending: pendingAppointments,
      percentage: Math.min(100, Math.round((confirmedAppointments / capacity) * 100))
    };
    
    const recentPosts = await ForumPost.find({ date: { $gte: startDate } });
    const totalReplies = recentPosts.reduce((sum, p) => sum + p.replies.length, 0);
    
    const dailyMoodTrend = [];
    const pointsToPlot = Math.min(days, 14); // Limit trend points for visual clarity
    for (let i = pointsToPlot - 1; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dayStart = new Date(date.setHours(0, 0, 0, 0));
      const dayEnd = new Date(date.setHours(23, 59, 59, 999));
      
      const dayEntries = await MoodEntry.find({
        ...moodQuery,
        date: { $gte: dayStart, $lte: dayEnd }
      });
      
      dailyMoodTrend.push({
        date: days <= 7 ? dayStart.toLocaleDateString('en-US', { weekday: 'short' }) : dayStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        mood: dayEntries.length > 0 
          ? (dayEntries.reduce((sum, e) => sum + e.mood, 0) / dayEntries.length).toFixed(1)
          : 0,
        count: dayEntries.length
      });
    }
    
    res.json({
      overview: { totalUsers, totalStudents, totalCounsellors },
      mood: { avgMood, distribution: moodDistribution, trend: dailyMoodTrend },
      quizzes: { stats: quizStats, severityCounts },
      appointments: { pending: pendingAppointments, confirmed: confirmedAppointments },
      forum: { posts: recentPosts.length, replies: totalReplies },
      utilization,
      generatedAt: new Date().toISOString()
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;