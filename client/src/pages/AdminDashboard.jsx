import { useState, useEffect } from 'react';
import Navbar from '../components/common/Navbar';
import Sidebar from '../components/common/Sidebar';
import Card from '../components/common/Card';
import { adminAPI } from '../services/api';
import { Users, Smile, ClipboardList, Calendar, MessageSquare, TrendingUp, Activity } from 'lucide-react';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { SEVERITY_COLORS } from '../utils/constants';

const COLORS = ['#0D9488', '#14B8A6', '#A78BFA', '#F59E0B', '#EF4444'];

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [days, setDays] = useState(7);
  const [department, setDepartment] = useState('');
  const [yearOfStudy, setYearOfStudy] = useState('');

  useEffect(() => {
    fetchStats();
  }, [days, department, yearOfStudy]);

  const fetchStats = async () => {
    setLoading(true);
    try {
      const { data } = await adminAPI.getStats({ days, department, yearOfStudy });
      setStats(data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading && !stats) {
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

  const moodDistributionData = [
    { name: 'Excellent', value: stats?.mood?.distribution?.excellent || 0, fill: '#22C55E' },
    { name: 'Good', value: stats?.mood?.distribution?.good || 0, fill: '#84CC16' },
    { name: 'Neutral', value: stats?.mood?.distribution?.neutral || 0, fill: '#EAB308' },
    { name: 'Low', value: stats?.mood?.distribution?.low || 0, fill: '#F97316' },
    { name: 'Poor', value: stats?.mood?.distribution?.poor || 0, fill: '#EF4444' }
  ];

  const quizSeverityData = stats?.quizzes?.severityCounts 
    ? Object.entries(stats.quizzes.severityCounts).map(([name, value]) => ({ name, value }))
    : [];

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 p-3 rounded-xl shadow-lg">
          <p className="font-medium text-gray-800 dark:text-gray-200 mb-1">{label || 'Data'}</p>
          {payload.map((entry, index) => (
            <p key={index} style={{ color: entry.color }} className="text-sm font-semibold">
              {entry.name || 'Value'}: {entry.value}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="min-h-screen bg-background-light dark:bg-background-dark transition-colors duration-300">
      <Navbar />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-4 lg:p-8 lg:ml-64">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
              <div>
                <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-2">Campus Analytics Dashboard</h1>
                <p className="text-gray-500 dark:text-gray-400">
                  Monitor anonymised mental health trends across the campus
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <select
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  className="bg-white dark:bg-gray-800 px-3 py-2 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 text-gray-700 dark:text-gray-200 font-medium focus:ring-0 cursor-pointer text-sm"
                >
                  <option value="">All Departments</option>
                  <option value="Computer Science">Computer Science</option>
                  <option value="Computer Application">Computer Application</option>
                  <option value="BCA">BCA</option>
                  <option value="Mechanical">Mechanical</option>
                  <option value="Electrical">Electrical</option>
                  <option value="Business">Business</option>
                  <option value="Psychology">Psychology</option>
                </select>

                <select
                  value={yearOfStudy}
                  onChange={(e) => setYearOfStudy(e.target.value)}
                  className="bg-white dark:bg-gray-800 px-3 py-2 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 text-gray-700 dark:text-gray-200 font-medium focus:ring-0 cursor-pointer text-sm"
                >
                  <option value="">All Years</option>
                  <option value="1">1st Year</option>
                  <option value="2">2nd Year</option>
                  <option value="3">3rd Year</option>
                  <option value="4">4th Year (Final)</option>
                </select>

                <div className="flex items-center space-x-2 bg-white dark:bg-gray-800 px-4 py-2 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
                  <Calendar className="w-5 h-5 text-gray-400" />
                  <select 
                    value={days} 
                    onChange={(e) => setDays(Number(e.target.value))}
                    className="bg-transparent border-none text-gray-700 dark:text-gray-200 font-medium focus:ring-0 cursor-pointer text-sm"
                  >
                    <option value={7}>Last 7 Days</option>
                    <option value={14}>Last 14 Days</option>
                    <option value={30}>Last 30 Days</option>
                    <option value={90}>This Semester (90 Days)</option>
                  </select>
                </div>
              </div>
            </div>



            <div className="grid lg:grid-cols-4 gap-4 mb-8">
              <Card className="text-center relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-24 h-24 bg-blue-50 dark:bg-blue-900/10 rounded-full -mr-12 -mt-12 transition-transform group-hover:scale-150" />
                <div className="relative z-10">
                  <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/50 rounded-full flex items-center justify-center mx-auto mb-2">
                    <Users className="w-6 h-6 text-blue-500 dark:text-blue-400" />
                  </div>
                  <p className="text-3xl font-bold text-gray-800 dark:text-white">{stats?.overview?.totalUsers || 0}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Total Users</p>
                </div>
              </Card>
              
              <Card className="text-center relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-24 h-24 bg-green-50 dark:bg-green-900/10 rounded-full -mr-12 -mt-12 transition-transform group-hover:scale-150" />
                <div className="relative z-10">
                  <div className="w-12 h-12 bg-green-100 dark:bg-green-900/50 rounded-full flex items-center justify-center mx-auto mb-2">
                    <Smile className="w-6 h-6 text-green-500 dark:text-green-400" />
                  </div>
                  <p className="text-3xl font-bold text-gray-800 dark:text-white">{stats?.mood?.avgMood || 0}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Avg Mood Score</p>
                </div>
              </Card>
              
              <Card className="text-center relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-24 h-24 bg-purple-50 dark:bg-purple-900/10 rounded-full -mr-12 -mt-12 transition-transform group-hover:scale-150" />
                <div className="relative z-10">
                  <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/50 rounded-full flex items-center justify-center mx-auto mb-2">
                    <ClipboardList className="w-6 h-6 text-purple-500 dark:text-purple-400" />
                  </div>
                  <p className="text-3xl font-bold text-gray-800 dark:text-white">
                    {Object.values(stats?.quizzes?.stats || {}).reduce((a, b) => a + b, 0)}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Quizzes Taken</p>
                </div>
              </Card>
              
              <Card className="text-center relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-24 h-24 bg-yellow-50 dark:bg-yellow-900/10 rounded-full -mr-12 -mt-12 transition-transform group-hover:scale-150" />
                <div className="relative z-10">
                  <div className="w-12 h-12 bg-yellow-100 dark:bg-yellow-900/50 rounded-full flex items-center justify-center mx-auto mb-2">
                    <Calendar className="w-6 h-6 text-yellow-500 dark:text-yellow-400" />
                  </div>
                  <div className="flex items-baseline justify-center space-x-1">
                    <p className="text-3xl font-bold text-gray-800 dark:text-white">{stats?.utilization?.booked || 0}</p>
                    <p className="text-sm font-medium text-gray-400">/ {stats?.utilization?.capacity || 0}</p>
                  </div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Counselor Utilization</p>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 h-1.5 rounded-full mt-3 overflow-hidden">
                    <div 
                      className={`h-full rounded-full ${stats?.utilization?.percentage >= 80 ? 'bg-red-500' : 'bg-yellow-500'}`}
                      style={{ width: `${Math.min(100, stats?.utilization?.percentage || 0)}%` }}
                    />
                  </div>
                </div>
              </Card>
            </div>

            <div className="grid lg:grid-cols-2 gap-6 mb-8">
              <Card title={`${days}-Day Mood Trend`} subtitle="Average mood scores">
                <div className="h-64 mt-4">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={stats?.mood?.trend || []}>
                      <XAxis dataKey="date" stroke="#888" fontSize={12} tickMargin={10} />
                      <YAxis domain={[1, 5]} stroke="#888" fontSize={12} />
                      <Tooltip content={<CustomTooltip />} />
                      <Line 
                        type="monotone" 
                        dataKey="mood" 
                        stroke="#0D9488" 
                        strokeWidth={3} 
                        dot={{ fill: '#0D9488', r: 4, strokeWidth: 2, stroke: '#fff' }}
                        activeDot={{ r: 6, strokeWidth: 0 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </Card>

              <Card title="Mood Distribution" subtitle={`Over the last ${days} days`}>
                <div className="h-64 mt-4">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={moodDistributionData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {moodDistributionData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.fill} />
                        ))}
                      </Pie>
                      <Tooltip content={<CustomTooltip />} />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </Card>
            </div>

            <div className="grid lg:grid-cols-2 gap-6">
              <Card title="Quiz Completion by Type" subtitle={`Last ${days} days`}>
                <div className="h-64 mt-4">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={[
                      { name: 'PHQ-9', value: stats?.quizzes?.stats?.PHQ9 || 0 },
                      { name: 'GAD-7', value: stats?.quizzes?.stats?.GAD7 || 0 },
                      { name: 'PSS-10', value: stats?.quizzes?.stats?.PSS10 || 0 },
                      { name: 'ISI', value: stats?.quizzes?.stats?.ISI || 0 },
                      { name: 'GHQ-12', value: stats?.quizzes?.stats?.GHQ12 || 0 }
                    ]}>
                      <XAxis dataKey="name" stroke="#888" fontSize={12} tickMargin={10} />
                      <YAxis stroke="#888" fontSize={12} />
                      <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(13, 148, 136, 0.1)' }} />
                      <Bar dataKey="value" fill="#0D9488" radius={[6, 6, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </Card>

              <Card title="Severity Distribution" subtitle="Across all quizzes">
                <div className="h-64 mt-4">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={quizSeverityData}
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        dataKey="value"
                      >
                        {quizSeverityData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip content={<CustomTooltip />} />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </Card>
            </div>

            <div className="mt-6">
              <Card>
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-gray-800 dark:text-white">Forum Activity</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {stats?.forum?.posts || 0} posts and {stats?.forum?.replies || 0} replies in the selected period
                    </p>
                  </div>
                  <MessageSquare className="w-8 h-8 text-accent opacity-80" />
                </div>
              </Card>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}


