import { useState, useEffect } from 'react';
import Navbar from '../components/common/Navbar';
import Sidebar from '../components/common/Sidebar';
import Card from '../components/common/Card';
import { useApp } from '../context/AppContext';
import { moodAPI, quizAPI, journalAPI } from '../services/api';
import { MOOD_LABELS } from '../utils/constants';
import { LineChart, Line, BarChart, Bar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer, XAxis, YAxis, Tooltip, Area, AreaChart } from 'recharts';
import { TrendingUp, Calendar, Flame, BookOpen, Target, Zap } from 'lucide-react';

export default function Progress() {
  const { user } = useApp();
  const [moodData, setMoodData] = useState([]);
  const [quizData, setQuizData] = useState([]);
  const [journalData, setJournalData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, [user]);

  const fetchData = async () => {
    if (!user?._id) return;
    try {
      const [moodRes, quizRes, journalRes] = await Promise.all([
        moodAPI.getAll(user._id),
        quizAPI.getAll(user._id),
        journalAPI.getAll(user._id)
      ]);
      setMoodData(moodRes.data);
      setQuizData(quizRes.data);
      setJournalData(journalRes.data);
    } catch (error) {
      console.error('Error fetching progress data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getWeeklyMoodData = () => {
    const last7Days = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dayData = moodData.filter(m => {
        const mDate = new Date(m.date);
        return mDate.toDateString() === date.toDateString();
      });
      last7Days.push({
        day: date.toLocaleDateString('en-US', { weekday: 'short' }),
        mood: dayData.length > 0 ? dayData[0].mood : null,
        emoji: dayData.length > 0 ? MOOD_LABELS[dayData[0].mood]?.emoji : '—'
      });
    }
    return last7Days;
  };

  const getMonthlyMoodData = () => {
    const last30Days = [];
    for (let i = 29; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dayMoods = moodData.filter(m => new Date(m.date).toDateString() === date.toDateString());
      const avgMood = dayMoods.length > 0 ? dayMoods.reduce((sum, m) => sum + m.mood, 0) / dayMoods.length : null;
      last30Days.push({
        date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        mood: avgMood
      });
    }
    return last30Days;
  };

  const getQuizProgressData = () => {
    const quizTypes = ['PHQ-9', 'GAD-7', 'PSS-10', 'ISI', 'GHQ-12'];
    return quizTypes.map(type => ({
      name: type,
      completed: quizData.filter(q => q.quizType === type).length,
      lastScore: quizData.find(q => q.quizType === type)?.score || 0
    }));
  };

  const getJournalSentimentData = () => {
    const weekly = [];
    for (let i = 3; i >= 0; i--) {
      const weekStart = new Date();
      weekStart.setDate(weekStart.getDate() - (i + 1) * 7);
      const weekEnd = new Date();
      weekEnd.setDate(weekEnd.getDate() - i * 7);
      
      const weekJournals = journalData.filter(j => {
        const date = new Date(j.date);
        return date >= weekStart && date < weekEnd;
      });
      
      const avgScore = weekJournals.length > 0 
        ? weekJournals.reduce((sum, j) => sum + (j.sentimentScore || 0), 0) / weekJournals.length 
        : 0;
      
      weekly.push({
        week: `Week ${4 - i}`,
        sentiment: avgScore,
        entries: weekJournals.length
      });
    }
    return weekly;
  };

  const getWellnessRadar = () => {
    const moodAvg = moodData.length > 0 ? moodData.reduce((sum, m) => sum + m.mood, 0) / moodData.length / 5 * 100 : 50;
    const quizCount = quizData.length > 0 ? Math.min(quizData.length / 5 * 100, 100) : 20;
    const journalCount = journalData.length > 0 ? Math.min(journalData.length / 10 * 100, 100) : 10;
    const streakDays = Math.min((moodData[0]?.streak || 0) / 7 * 100, 100);
    const positiveRatio = moodData.filter(m => m.mood >= 4).length / Math.max(moodData.length, 1) * 100;
    
    return [
      { category: 'Mood Tracking', value: Math.round(moodAvg) },
      { category: 'Self-Assessment', value: Math.round(quizCount) },
      { category: 'Journaling', value: Math.round(journalCount) },
      { category: 'Consistency', value: Math.round(streakDays) },
      { category: 'Positive Outlook', value: Math.round(positiveRatio) }
    ];
  };

  const getWeeklySummary = () => {
    const last7Days = moodData.filter(m => {
      const diff = Date.now() - new Date(m.date).getTime();
      return diff < 7 * 24 * 60 * 60 * 1000;
    });
    
    if (last7Days.length === 0) return "Start logging your mood to see your weekly summary!";
    
    const avgMood = last7Days.reduce((sum, m) => sum + m.mood, 0) / last7Days.length;
    const positiveDays = last7Days.filter(m => m.mood >= 4).length;
    const quizzesThisWeek = quizData.filter(q => {
      const diff = Date.now() - new Date(q.date).getTime();
      return diff < 7 * 24 * 60 * 60 * 1000;
    }).length;
    
    let summary = `This week you've logged ${last7Days.length} mood entries. `;
    summary += `Your average mood was ${avgMood.toFixed(1)}/5 (${MOOD_LABELS[Math.round(avgMood)]?.label}). `;
    summary += `${positiveDays} days were positive (mood 4-5). `;
    if (quizzesThisWeek > 0) summary += `You completed ${quizzesThisWeek} self-assessment(s). `;
    summary += avgMood >= 4 ? "Keep up the great work!" : avgMood >= 3 ? "You're doing okay. Keep tracking!" : "Consider reaching out for support if you need it.";
    
    return summary;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background-light dark:bg-background-dark">
        <Navbar />
        <div className="flex">
          <Sidebar />
          <main className="flex-1 p-8 flex items-center justify-center">
            <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background-light dark:bg-background-dark transition-colors duration-300">
      <Navbar />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-4 lg:p-8 lg:ml-64">
          <div className="max-w-6xl mx-auto">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-2">Your Progress Report</h1>
              <p className="text-gray-500 dark:text-gray-400">Track your wellness journey over time</p>
            </div>

            <Card className="mb-6 bg-gradient-to-r from-primary/10 to-accent/10">
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-primary dark:bg-primary rounded-xl flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800 dark:text-white mb-1">Weekly Summary</h3>
                  <p className="text-gray-600 dark:text-gray-300">{getWeeklySummary()}</p>
                </div>
              </div>
            </Card>

            <div className="grid lg:grid-cols-4 gap-4 mb-6">
              <Card className="text-center">
                <Calendar className="w-8 h-8 text-blue-500 mx-auto mb-2" />
                <p className="text-3xl font-bold text-gray-800 dark:text-white">{moodData.length}</p>
                <p className="text-sm text-gray-500">Total Entries</p>
              </Card>
              <Card className="text-center">
                <Flame className="w-8 h-8 text-orange-500 mx-auto mb-2" />
                <p className="text-3xl font-bold text-gray-800 dark:text-white">{moodData[0]?.streak || 0}</p>
                <p className="text-sm text-gray-500">Day Streak</p>
              </Card>
              <Card className="text-center">
                <Target className="w-8 h-8 text-purple-500 mx-auto mb-2" />
                <p className="text-3xl font-bold text-gray-800 dark:text-white">{quizData.length}</p>
                <p className="text-sm text-gray-500">Quizzes Done</p>
              </Card>
              <Card className="text-center">
                <BookOpen className="w-8 h-8 text-pink-500 mx-auto mb-2" />
                <p className="text-3xl font-bold text-gray-800 dark:text-white">{journalData.length}</p>
                <p className="text-sm text-gray-500">Journal Entries</p>
              </Card>
            </div>

            <div className="grid lg:grid-cols-2 gap-6 mb-6">
              <Card title="7-Day Mood Trend">
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={getWeeklyMoodData()}>
                      <XAxis dataKey="day" stroke="#888" fontSize={12} />
                      <YAxis domain={[1, 5]} ticks={[1, 2, 3, 4, 5]} stroke="#888" fontSize={12} />
                      <Tooltip />
                      <Line type="monotone" dataKey="mood" stroke="#0D9488" strokeWidth={3} dot={{ fill: '#0D9488', r: 6 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </Card>

              <Card title="30-Day Mood Journey">
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={getMonthlyMoodData()}>
                      <defs>
                        <linearGradient id="moodGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#0D9488" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="#0D9488" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <XAxis dataKey="date" stroke="#888" fontSize={10} />
                      <YAxis domain={[1, 5]} stroke="#888" fontSize={12} />
                      <Tooltip />
                      <Area type="monotone" dataKey="mood" stroke="#0D9488" strokeWidth={2} fill="url(#moodGradient)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </Card>
            </div>

            <div className="grid lg:grid-cols-2 gap-6 mb-6">
              <Card title="Overall Wellness">
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart data={getWellnessRadar()}>
                      <PolarGrid />
                      <PolarAngleAxis dataKey="category" fontSize={12} />
                      <PolarRadiusAxis domain={[0, 100]} />
                      <Radar name="Wellness" dataKey="value" stroke="#0D9488" fill="#0D9488" fillOpacity={0.3} />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>
              </Card>

              <Card title="Quiz Progress">
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={getQuizProgressData()}>
                      <XAxis dataKey="name" stroke="#888" fontSize={12} />
                      <YAxis stroke="#888" fontSize={12} />
                      <Tooltip />
                      <Bar dataKey="completed" fill="#A78BFA" radius={[8, 8, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </Card>
            </div>

            <Card title="Journal Sentiment Trend">
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={getJournalSentimentData()}>
                    <defs>
                      <linearGradient id="sentimentGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#A78BFA" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#A78BFA" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="week" stroke="#888" fontSize={12} />
                    <YAxis domain={[0, 1]} stroke="#888" fontSize={12} />
                    <Tooltip />
                    <Area type="monotone" dataKey="sentiment" stroke="#A78BFA" strokeWidth={2} fill="url(#sentimentGradient)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
}


