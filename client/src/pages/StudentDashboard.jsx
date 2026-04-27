import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useApp } from "../context/AppContext";
import Navbar from "../components/common/Navbar";
import Sidebar from "../components/common/Sidebar";
import Card from "../components/common/Card";
import { moodAPI, quizAPI, announcementsAPI } from "../services/api";
import { MOOD_LABELS, SEVERITY_COLORS } from "../utils/constants";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import {
  Smile,
  ClipboardList,
  BookOpen,
  MessageCircle,
  Calendar,
  Flame,
  TrendingUp,
  Heart,
  ArrowRight,
  Megaphone,
  X,
} from "lucide-react";

export default function StudentDashboard() {
  const { user } = useApp();
  const [moodData, setMoodData] = useState([]);
  const [quizResults, setQuizResults] = useState([]);
  const [streak, setStreak] = useState(0);
  const [announcements, setAnnouncements] = useState([]);
  const [dismissedAnnouncements, setDismissedAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (!user?._id || user._id.startsWith("temp-")) {
        setLoading(false);
        return;
      }
      try {
        const [moodRes, quizRes, streakRes, announcementsRes] =
          await Promise.all([
            moodAPI.getAll(user._id),
            quizAPI.getAll(user._id),
            moodAPI.getStreak(user._id),
            announcementsAPI.getAll({ 
              department: user.department, 
              year: user.yearOfStudy 
            }),
          ]);
        setMoodData(moodRes.data);
        setQuizResults(quizRes.data);
        setStreak(streakRes.data.streak);
        setAnnouncements(announcementsRes.data.filter((a) => a.isActive));
      } catch (error) {
        console.error("Dashboard data error:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();

    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, [user]);

  const dismissAnnouncement = (id) => {
    setDismissedAnnouncements([...dismissedAnnouncements, id]);
  };

  const activeAnnouncements = announcements.filter(
    (a) => !dismissedAnnouncements.includes(a._id) && a.isActive,
  );

  const hasRealData = moodData.length > 0 || quizResults.length > 0;

  const sampleMoodData = [
    { date: "Mon", mood: 4 },
    { date: "Tue", mood: 3 },
    { date: "Wed", mood: 4 },
    { date: "Thu", mood: 5 },
    { date: "Fri", mood: 4 },
    { date: "Sat", mood: 3 },
    { date: "Sun", mood: 4 },
  ];

  const chartData = hasRealData
    ? moodData
        .slice(0, 7)
        .reverse()
        .map((entry) => ({
          date: new Date(entry.date).toLocaleDateString("en-US", {
            weekday: "short",
          }),
          mood: entry.mood,
        }))
    : sampleMoodData;

  const latestMood = moodData[0];
  const latestQuiz = quizResults[0];

  const quickActions = [
    {
      to: "/mood",
      icon: Smile,
      label: "Log Mood",
      gradient: "from-emerald-400 to-emerald-600",
      bg: "bg-emerald-100 dark:bg-emerald-900/30",
    },
    {
      to: "/quiz",
      icon: ClipboardList,
      label: "Take Quiz",
      gradient: "from-blue-400 to-indigo-600",
      bg: "bg-blue-100 dark:bg-blue-900/30",
    },
    {
      to: "/journal",
      icon: BookOpen,
      label: "Write Journal",
      gradient: "from-purple-400 to-pink-600",
      bg: "bg-purple-100 dark:bg-purple-900/30",
    },
    {
      to: "/chat",
      icon: MessageCircle,
      label: "Chat with MindBot",
      gradient: "from-cyan-400 to-blue-600",
      bg: "bg-cyan-100 dark:bg-cyan-900/30",
    },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-background-light dark:bg-background-dark">
        <Navbar />
        <div className="flex">
          <Sidebar />
          <main className="flex-1 p-8 flex items-center justify-center">
            <div className="text-center">
              <div className="w-16 h-16 border-4 border-primary/20 border-t-primary rounded-full animate-spin mx-auto mb-4" />
              <p className="text-gray-500 dark:text-gray-400">
                Loading your dashboard...
              </p>
            </div>
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
            {activeAnnouncements.length > 0 && (
              <div className="mb-6 space-y-3">
                {activeAnnouncements.map((announcement) => (
                  <div
                    key={announcement._id}
                    className="flex items-start space-x-4 p-4 bg-gradient-to-r from-primary/10 to-accent/10 rounded-xl border border-primary/20"
                  >
                    <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center flex-shrink-0">
                      <Megaphone className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <h3 className="font-semibold text-gray-800 dark:text-white">
                          {announcement.title}
                        </h3>
                        {announcement.priority === "high" && (
                          <span className="px-2 py-0.5 bg-danger text-white text-xs rounded-full font-medium">
                            Urgent
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-300">
                        {announcement.content}
                      </p>
                      {announcement.link && (
                        <Link
                          to={announcement.link}
                          className="text-sm text-primary hover:underline"
                        >
                          Learn more →
                        </Link>
                      )}
                    </div>
                    <button
                      onClick={() => dismissAnnouncement(announcement._id)}
                      className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                    >
                      <X className="w-5 h-5 text-gray-400" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-2">
                Welcome back, {(user?.name || 'User').split(" ")[0]}!
              </h1>
              <p className="text-gray-500 dark:text-gray-400">
                Here's how you're doing today
              </p>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              {quickActions.map((action) => {
                const Icon = action.icon;
                return (
                  <Link
                    key={action.to}
                    to={action.to}
                    className={`p-5 rounded-2xl bg-gradient-to-br ${action.gradient} text-white shadow-lg hover:shadow-xl transition-all hover:-translate-y-1`}
                  >
                    <Icon className="w-7 h-7 mb-2" />
                    <span className="font-semibold text-sm">{action.label}</span>
                  </Link>
                );
              })}
            </div>

            <div className="grid lg:grid-cols-3 gap-6">
              <Card className="lg:col-span-2">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-gray-800 dark:text-white flex items-center">
                    <TrendingUp className="w-5 h-5 mr-2 text-primary" />
                    Your Mood Journey
                  </h2>
                  <Link
                    to="/mood"
                    className="text-sm text-primary hover:underline font-medium"
                  >
                    View All
                  </Link>
                </div>
                {hasRealData ? (
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={chartData}>
                        <XAxis dataKey="date" stroke="#888" fontSize={12} />
                        <YAxis
                          domain={[1, 5]}
                          ticks={[1, 2, 3, 4, 5]}
                          stroke="#888"
                          fontSize={12}
                        />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "rgba(255,255,255,0.95)",
                            border: "none",
                            borderRadius: "12px",
                            boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
                          }}
                        />
                        <Line
                          type="monotone"
                          dataKey="mood"
                          stroke="#4F46E5"
                          strokeWidth={3}
                          dot={{ fill: "#4F46E5", strokeWidth: 2, r: 5 }}
                          activeDot={{ r: 7, fill: "#6366F1" }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <div className="h-64 flex flex-col items-center justify-center text-gray-400 space-y-4">
                    <TrendingUp className="w-12 h-12 opacity-20" />
                    <p className="text-center px-4">Start logging your mood to see your journey over time!</p>
                    <Link
                      to="/mood"
                      className="px-6 py-2.5 bg-primary text-white rounded-xl shadow-sm hover:shadow-md transition-all font-medium"
                    >
                      Log Your First Mood
                    </Link>
                  </div>
                )}
              </Card>

              <Card className="relative overflow-hidden">
                <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-orange-400 to-amber-500 rounded-full -mr-12 -mt-12 opacity-10" />
                <div className="relative">
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-orange-400 to-amber-500 rounded-xl flex items-center justify-center">
                      <Flame className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Current Streak
                      </p>
                      <p className="text-3xl font-bold text-gray-800 dark:text-white">
                        {streak} days
                      </p>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Keep logging your mood daily to build your streak!
                  </p>
                </div>
              </Card>

              <Card
                title="Latest Quiz Result"
                subtitle={
                  latestQuiz
                    ? `Taken on ${new Date(latestQuiz.date).toLocaleDateString()}`
                    : "No quizzes yet"
                }
              >
                {latestQuiz ? (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-2xl">
                        {latestQuiz.quizType === "PHQ-9"
                          ? "📋"
                          : latestQuiz.quizType === "GAD-7"
                            ? "😰"
                            : "📊"}
                      </span>
                      <span
                        className={`px-3 py-1 rounded-full text-sm font-medium ${SEVERITY_COLORS[latestQuiz.severity] || ""}`}
                      >
                        {latestQuiz.severity}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600 dark:text-gray-400">
                        Score
                      </span>
                      <span className="font-bold text-gray-800 dark:text-white">
                        {latestQuiz.score}/
                        {latestQuiz.quizType === "PHQ-9"
                          ? "27"
                          : latestQuiz.quizType === "GAD-7"
                            ? "21"
                            : latestQuiz.quizType === "PSS-10"
                              ? "40"
                              : latestQuiz.quizType === "ISI"
                                ? "28"
                                : "36"}
                      </span>
                    </div>
                    <Link
                      to="/quiz"
                      className="inline-flex items-center text-sm text-primary hover:underline font-medium"
                    >
                      Take another quiz <ArrowRight className="w-4 h-4 ml-1" />
                    </Link>
                  </div>
                ) : (
                  <p className="text-gray-500 dark:text-gray-400">
                    Take a quiz to check your mental health
                  </p>
                )}
              </Card>

              <Card
                title="How You're Feeling"
                subtitle={
                  latestMood
                    ? new Date(latestMood.date).toLocaleDateString()
                    : "Log your first mood"
                }
              >
                {latestMood ? (
                  <div className="text-center">
                    <span className="text-6xl mb-2 block">
                      {MOOD_LABELS[latestMood.mood]?.emoji}
                    </span>
                    <p
                      className={`text-xl font-semibold ${MOOD_LABELS[latestMood.mood]?.color}`}
                    >
                      {MOOD_LABELS[latestMood.mood]?.label}
                    </p>
                    <Link
                      to="/mood"
                      className="inline-flex items-center mt-3 text-sm text-primary hover:underline font-medium"
                    >
                      Log today's mood <ArrowRight className="w-4 h-4 ml-1" />
                    </Link>
                  </div>
                ) : (
                  <div className="text-center py-4">
                    <span className="text-5xl mb-2 block">😊</span>
                    <p className="text-gray-500 dark:text-gray-400 mb-3">
                      How are you feeling today?
                    </p>
                    <Link
                      to="/mood"
                      className="inline-flex items-center px-5 py-2.5 bg-primary text-white rounded-xl hover:bg-primary-700 transition-all font-medium"
                    >
                      Log Mood
                    </Link>
                  </div>
                )}
              </Card>

              <Card className="bg-gradient-to-br from-primary/10 to-accent/10">
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center flex-shrink-0">
                    <Heart className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-800 dark:text-white mb-1">
                      Self-Care Reminder
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                      Taking care of your mental health is just as important as
                      your physical health. Small steps every day make a big
                      difference.
                    </p>
                    <div className="flex flex-wrap gap-2">
                      <span className="px-3 py-1 bg-white/60 dark:bg-gray-800/60 rounded-full text-xs font-medium">
                        Stay hydrated 💧
                      </span>
                      <span className="px-3 py-1 bg-white/60 dark:bg-gray-800/60 rounded-full text-xs font-medium">
                        Take walks 🚶
                      </span>
                      <span className="px-3 py-1 bg-white/60 dark:bg-gray-800/60 rounded-full text-xs font-medium">
                        Sleep well 😴
                      </span>
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}


