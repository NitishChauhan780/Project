import { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import Navbar from '../components/common/Navbar';
import Sidebar from '../components/common/Sidebar';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Modal from '../components/common/Modal';
import { moodAPI } from '../services/api';
import { useToast } from '../context/ToastContext';
import { MOOD_LABELS, MOOD_REASONS } from '../utils/constants';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { Smile, Calendar, CheckCircle, Clock, Flame } from 'lucide-react';

export default function MoodTracker() {
  const { user } = useApp();
  const toast = useToast();
  const [moodData, setMoodData] = useState([]);
  const [streak, setStreak] = useState(0);
  const [showModal, setShowModal] = useState(false);
  const [selectedMood, setSelectedMood] = useState(null);
  const [selectedReasons, setSelectedReasons] = useState([]);
  const [note, setNote] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchMoodData();
  }, [user]);

  const fetchMoodData = async () => {
    if (!user?._id) return;
    try {
      const [moodRes, streakRes] = await Promise.all([
        moodAPI.getAll(user._id),
        moodAPI.getStreak(user._id)
      ]);
      setMoodData(moodRes.data);
      setStreak(streakRes.data.streak);
    } catch (error) {
      console.error('Error fetching mood data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleMoodSelect = (mood) => {
    setSelectedMood(mood);
  };

  const handleReasonToggle = (reason) => {
    setSelectedReasons(prev => 
      prev.includes(reason) 
        ? prev.filter(r => r !== reason)
        : [...prev, reason]
    );
  };

  const handleSubmit = async () => {
    if (!selectedMood) return;
    setSubmitting(true);
    try {
      await moodAPI.create({
        userId: user._id,
        mood: selectedMood,
        reasonTags: selectedReasons,
        note
      });
      setShowModal(false);
      setSelectedMood(null);
      setSelectedReasons([]);
      setNote('');
      fetchMoodData();
      toast.success('Mood logged successfully!');
    } catch (error) {
      console.error('Error saving mood:', error);
      toast.error('Failed to save mood');
    } finally {
      setSubmitting(false);
    }
  };

  const chartData = moodData.slice(0, 14).reverse().map(entry => ({
    date: new Date(entry.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    mood: entry.mood,
    emoji: MOOD_LABELS[entry.mood]?.emoji
  }));

  const moodStats = {
    average: moodData.length > 0 
      ? (moodData.reduce((sum, m) => sum + m.mood, 0) / moodData.length).toFixed(1)
      : 0,
    entries: moodData.length,
    goodDays: moodData.filter(m => m.mood >= 4).length
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
            <div className="flex items-center justify-between mb-8">
              <div>
                <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-2">Mood Tracker</h1>
                <p className="text-gray-500 dark:text-gray-400">Track your emotional wellbeing over time</p>
              </div>
              <Button onClick={() => setShowModal(true)} icon={Smile}>
                Log Today's Mood
              </Button>
            </div>

            <div className="grid lg:grid-cols-4 gap-4 mb-8">
              <Card className="text-center">
                <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900 rounded-full flex items-center justify-center mx-auto mb-2">
                  <Flame className="w-6 h-6 text-orange-500" />
                </div>
                <p className="text-3xl font-bold text-gray-800 dark:text-white">{streak}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">Day Streak</p>
              </Card>
              <Card className="text-center">
                <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mx-auto mb-2">
                  <Smile className="w-6 h-6 text-green-500" />
                </div>
                <p className="text-3xl font-bold text-gray-800 dark:text-white">{moodStats.average}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">Avg Mood (1-5)</p>
              </Card>
              <Card className="text-center">
                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mx-auto mb-2">
                  <Calendar className="w-6 h-6 text-blue-500" />
                </div>
                <p className="text-3xl font-bold text-gray-800 dark:text-white">{moodStats.entries}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">Total Entries</p>
              </Card>
              <Card className="text-center">
                <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center mx-auto mb-2">
                  <CheckCircle className="w-6 h-6 text-purple-500" />
                </div>
                <p className="text-3xl font-bold text-gray-800 dark:text-white">{moodStats.goodDays}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">Good Days</p>
              </Card>
            </div>

            <Card title="Mood Journey" subtitle="Last 14 days" className="mb-8">
              {chartData.length > 0 ? (
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartData}>
                      <XAxis dataKey="date" stroke="#888" fontSize={12} />
                      <YAxis domain={[1, 5]} ticks={[1, 2, 3, 4, 5]} stroke="#888" fontSize={12} />
                      <Tooltip 
                        content={({ active, payload }) => {
                          if (active && payload && payload.length) {
                            return (
                              <div className="bg-white dark:bg-gray-800 p-3 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
                                <p className="font-medium text-gray-800 dark:text-white">{payload[0].payload.date}</p>
                                <p className="text-2xl">{payload[0].payload.emoji}</p>
                                <p className="text-sm text-gray-500">{MOOD_LABELS[payload[0].value]?.label}</p>
                              </div>
                            );
                          }
                          return null;
                        }}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="mood" 
                        stroke="#0D9488" 
                        strokeWidth={3} 
                        dot={{ fill: '#0D9488', strokeWidth: 2, r: 6 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="h-64 flex items-center justify-center text-gray-400">
                  <p>Start logging your mood to see your journey here!</p>
                </div>
              )}
            </Card>

            <Card title="Recent Entries">
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {moodData.slice(0, 10).map((entry, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <span className="text-3xl">{MOOD_LABELS[entry.mood]?.emoji}</span>
                      <div>
                        <p className="font-medium text-gray-800 dark:text-white">{MOOD_LABELS[entry.mood]?.label}</p>
                        <div className="flex items-center space-x-2 mt-1">
                          <Clock className="w-3 h-3 text-gray-400" />
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            {new Date(entry.date).toLocaleDateString('en-US', { 
                              month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' 
                            })}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {entry.reasonTags?.map(tag => (
                        <span key={tag} className="px-2 py-1 bg-accent/20 text-accent rounded text-xs">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </main>
      </div>

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="How are you feeling today?">
        <div className="space-y-6">
          <div className="grid grid-cols-5 gap-2">
            {[1, 2, 3, 4, 5].map(mood => (
              <button
                key={mood}
                onClick={() => handleMoodSelect(mood)}
                className={`p-4 rounded-xl text-center transition-all ${
                  selectedMood === mood
                    ? 'bg-primary dark:bg-primary text-white shadow-lg scale-110'
                    : 'bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                <span className="text-3xl block mb-1">{MOOD_LABELS[mood]?.emoji}</span>
                <span className="text-xs">{MOOD_LABELS[mood]?.label}</span>
              </button>
            ))}
          </div>

          <div>
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">What influenced your mood? (optional)</p>
            <div className="flex flex-wrap gap-2">
              {MOOD_REASONS.map(reason => (
                <button
                  key={reason}
                  onClick={() => handleReasonToggle(reason)}
                  className={`px-3 py-1.5 rounded-full text-sm capitalize transition-all ${
                    selectedReasons.includes(reason)
                      ? 'bg-accent text-white'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                >
                  {reason}
                </button>
              ))}
            </div>
          </div>

          <div>
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Add a note (optional)</p>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="What's on your mind?"
              rows={3}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-800 dark:text-white focus:ring-2 focus:ring-primary dark:focus:ring-primary transition-all resize-none"
            />
          </div>

          <Button onClick={handleSubmit} disabled={!selectedMood || submitting} className="w-full">
            {submitting ? 'Saving...' : 'Save Mood Entry'}
          </Button>
        </div>
      </Modal>
    </div>
  );
}


