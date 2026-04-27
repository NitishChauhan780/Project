import { useState, useEffect } from 'react';
import Navbar from '../components/common/Navbar';
import Sidebar from '../components/common/Sidebar';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import { useApp } from '../context/AppContext';
import { sleepAPI } from '../services/api';
import { Moon, Sun, Clock, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { BarChart, Bar, LineChart, Line, ResponsiveContainer, XAxis, YAxis, Tooltip } from 'recharts';

export default function SleepTracker() {
  const { user } = useApp();
  const [sleepData, setSleepData] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    bedtime: '',
    wakeTime: '',
    quality: 3,
    notes: '',
    dreamRecall: false,
    interruptions: 0,
    feeling: 'tired'
  });

  useEffect(() => {
    if (user?._id) {
      fetchSleepData();
    }
  }, [user]);

  const fetchSleepData = async () => {
    try {
      const [dataRes, statsRes] = await Promise.all([
        sleepAPI.getAll(user._id),
        sleepAPI.getStats(user._id)
      ]);
      setSleepData(dataRes.data);
      setStats(statsRes.data);
    } catch (error) {
      console.error('Error fetching sleep data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const today = new Date().toISOString().split('T')[0];
      await sleepAPI.create({
        userId: user._id,
        date: today,
        bedtime: formData.bedtime,
        wakeTime: formData.wakeTime,
        quality: formData.quality,
        notes: formData.notes,
        dreamRecall: formData.dreamRecall,
        interruptions: formData.interruptions,
        feeling: formData.feeling
      });
      setShowForm(false);
      setFormData({ bedtime: '', wakeTime: '', quality: 3, notes: '', dreamRecall: false, interruptions: 0, feeling: 'tired' });
      fetchSleepData();
    } catch (error) {
      console.error('Error saving sleep entry:', error);
    }
  };

  const getQualityLabel = (quality) => {
    const labels = { 1: 'Very Poor', 2: 'Poor', 3: 'Fair', 4: 'Good', 5: 'Excellent' };
    return labels[quality] || 'Unknown';
  };

  const getQualityColor = (quality) => {
    if (quality <= 2) return 'text-red-500';
    if (quality === 3) return 'text-yellow-500';
    return 'text-green-500';
  };

  const getChartData = () => {
    return sleepData.slice(0, 14).reverse().map(entry => ({
      date: new Date(entry.date).toLocaleDateString('en-US', { weekday: 'short' }),
      hours: entry.sleepDuration,
      quality: entry.quality
    }));
  };

  const getCorrelationTrend = () => {
    if (!stats?.entries || stats.entries.length < 2) return 'neutral';
    const recent = stats.entries.slice(0, 3);
    const older = stats.entries.slice(3, 6);
    if (recent.length === 0 || older.length === 0) return 'neutral';
    
    const recentAvg = recent.reduce((sum, e) => sum + e.quality, 0) / recent.length;
    const olderAvg = older.reduce((sum, e) => sum + e.quality, 0) / older.length;
    
    if (recentAvg > olderAvg + 0.3) return 'improving';
    if (recentAvg < olderAvg - 0.3) return 'declining';
    return 'stable';
  };

  const formatTime = (timeStr) => {
    if (!timeStr) return '--:--';
    const date = new Date(timeStr);
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
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

  const chartData = getChartData();
  const trend = getCorrelationTrend();

  return (
    <div className="min-h-screen bg-background-light dark:bg-background-dark transition-colors duration-300">
      <Navbar />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-4 lg:p-8 lg:ml-64">
          <div className="max-w-6xl mx-auto">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-2">Sleep Tracker</h1>
                <p className="text-gray-500 dark:text-gray-400">
                  Monitor your sleep patterns and quality
                </p>
              </div>
              <Button onClick={() => setShowForm(true)}>
                <Moon className="w-4 h-4 mr-2" />
                Log Sleep
              </Button>
            </div>

            {stats && stats.avgDuration && (
              <div className="grid lg:grid-cols-4 gap-4 mb-8">
                <Card className="text-center">
                  <Moon className="w-8 h-8 text-indigo-500 mx-auto mb-2" />
                  <p className="text-3xl font-bold text-gray-800 dark:text-white">{stats.avgDuration}h</p>
                  <p className="text-sm text-gray-500">Avg Sleep</p>
                </Card>
                <Card className="text-center">
                  <TrendingUp className={`w-8 h-8 mx-auto mb-2 ${getQualityColor(Math.round(stats.avgQuality))}`} />
                  <p className={`text-3xl font-bold ${getQualityColor(Math.round(stats.avgQuality))}`}>{stats.avgQuality}/5</p>
                  <p className="text-sm text-gray-500">Avg Quality</p>
                </Card>
                <Card className="text-center">
                  <Clock className="w-8 h-8 text-blue-500 mx-auto mb-2" />
                  <p className="text-3xl font-bold text-gray-800 dark:text-white">{stats.totalNights}</p>
                  <p className="text-sm text-gray-500">Nights Tracked</p>
                </Card>
                <Card className="text-center">
                  {trend === 'improving' && <TrendingUp className="w-8 h-8 text-green-500 mx-auto mb-2" />}
                  {trend === 'declining' && <TrendingDown className="w-8 h-8 text-red-500 mx-auto mb-2" />}
                  {trend === 'stable' && <Minus className="w-8 h-8 text-gray-500 mx-auto mb-2" />}
                  <p className="text-xl font-bold text-gray-800 dark:text-white capitalize">{trend}</p>
                  <p className="text-sm text-gray-500">Trend</p>
                </Card>
              </div>
            )}

            {chartData.length > 0 && (
              <div className="grid lg:grid-cols-2 gap-6 mb-8">
                <Card title="Sleep Duration (Hours)">
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={chartData}>
                        <XAxis dataKey="date" stroke="#888" fontSize={12} />
                        <YAxis stroke="#888" fontSize={12} domain={[0, 12]} />
                        <Tooltip />
                        <Bar dataKey="hours" fill="#6366F1" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </Card>
                <Card title="Sleep Quality Trend">
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={chartData}>
                        <XAxis dataKey="date" stroke="#888" fontSize={12} />
                        <YAxis stroke="#888" fontSize={12} domain={[1, 5]} />
                        <Tooltip />
                        <Line type="monotone" dataKey="quality" stroke="#8B5CF6" strokeWidth={3} dot={{ fill: '#8B5CF6', r: 4 }} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </Card>
              </div>
            )}

            <Card title="Sleep History">
              {sleepData.length > 0 ? (
                <div className="space-y-4">
                  {sleepData.slice(0, 10).map(entry => (
                    <div key={entry._id} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-indigo-100 dark:bg-indigo-900 rounded-full flex items-center justify-center">
                          <Moon className="w-6 h-6 text-indigo-500" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-800 dark:text-white">
                            {new Date(entry.date).toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
                          </p>
                          <p className="text-sm text-gray-500">
                            {formatTime(entry.bedtime)} - {formatTime(entry.wakeTime)}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-xl font-bold text-gray-800 dark:text-white">{entry.sleepDuration}h</p>
                        <p className={`text-sm ${getQualityColor(entry.quality)}`}>
                          {getQualityLabel(entry.quality)}
                        </p>
                      </div>
                      <div className="flex items-center space-x-2">
                        {entry.feeling === 'refreshed' && <span className="text-2xl">😊</span>}
                        {entry.feeling === 'tired' && <span className="text-2xl">😐</span>}
                        {entry.feeling === 'exhausted' && <span className="text-2xl">😫</span>}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Moon className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                  <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">No Sleep Data Yet</h3>
                  <p className="text-gray-500 dark:text-gray-400 mb-4">Start tracking your sleep to see insights</p>
                  <Button onClick={() => setShowForm(true)}>Log Your First Sleep</Button>
                </div>
              )}
            </Card>
          </div>
        </main>
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md">
            <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-6">Log Sleep</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Bedtime</label>
                <input
                  type="datetime-local"
                  value={formData.bedtime}
                  onChange={(e) => setFormData({ ...formData, bedtime: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-800 dark:text-white"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Wake Time</label>
                <input
                  type="datetime-local"
                  value={formData.wakeTime}
                  onChange={(e) => setFormData({ ...formData, wakeTime: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-800 dark:text-white"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Sleep Quality: {getQualityLabel(formData.quality)}
                </label>
                <input
                  type="range"
                  min="1"
                  max="5"
                  value={formData.quality}
                  onChange={(e) => setFormData({ ...formData, quality: parseInt(e.target.value) })}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-gray-500">
                  <span>Poor</span><span>Excellent</span>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">How do you feel?</label>
                <select
                  value={formData.feeling}
                  onChange={(e) => setFormData({ ...formData, feeling: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-800 dark:text-white"
                >
                  <option value="refreshed">Refreshed</option>
                  <option value="tired">Tired</option>
                  <option value="exhausted">Exhausted</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Notes (optional)</label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-800 dark:text-white"
                  rows="2"
                />
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="dreamRecall"
                  checked={formData.dreamRecall}
                  onChange={(e) => setFormData({ ...formData, dreamRecall: e.target.checked })}
                  className="mr-2"
                />
                <label htmlFor="dreamRecall" className="text-sm text-gray-700 dark:text-gray-300">
                  Remembered dreams?
                </label>
              </div>
              <div className="flex space-x-4 pt-4">
                <Button type="button" variant="secondary" onClick={() => setShowForm(false)} className="flex-1">
                  Cancel
                </Button>
                <Button type="submit" className="flex-1">
                  Save
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}
    </div>
  );
}


