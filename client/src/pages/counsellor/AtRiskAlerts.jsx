import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../../components/common/Navbar';
import Sidebar from '../../components/common/Sidebar';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import { adminAlertsAPI, notificationAPI } from '../../services/api';
import { AlertTriangle, User, FileText, TrendingDown, ExternalLink, Send, CheckCircle2 } from 'lucide-react';
import { useToast } from '../../context/ToastContext';

export default function AtRiskAlerts() {
  const navigate = useNavigate();
  const toast = useToast();
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sendingId, setSendingId] = useState(null);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchAlerts();
  }, []);

  const fetchAlerts = async () => {
    try {
      const { data } = await adminAlertsAPI.getAtRisk();
      setAlerts(data);
    } catch (error) {
      console.error('Error fetching alerts:', error);
    } finally {
      setLoading(false);
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'severe_quiz': return <FileText className="w-5 h-5" />;
      case 'low_mood': return <TrendingDown className="w-5 h-5" />;
      case 'crisis_journal': return <AlertTriangle className="w-5 h-5" />;
      default: return <User className="w-5 h-5" />;
    }
  };

  const getTypeLabel = (type) => {
    switch (type) {
      case 'severe_quiz': return 'Severe Quiz Score';
      case 'low_mood': return 'Consistently Low Mood';
      case 'crisis_journal': return 'Crisis Keywords Detected';
      default: return type;
    }
  };

  const getPriorityColor = (priority) => {
    return priority === 'high'
      ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300 border-red-200 dark:border-red-800'
      : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300 border-yellow-200 dark:border-yellow-800';
  };

  const handleSendWellnessCheck = async (studentId, studentName) => {
    setSendingId(studentId);
    try {
      await notificationAPI.create({
        userId: studentId,
        type: 'system',
        title: 'Priority Wellness Check-In',
        message: `Hello ${studentName}, your wellness counsellor would like to check in on you. Please consider booking a session or reaching out via chat when you're ready.`,
        priority: 'high',
        metadata: { link: '/appointments', icon: 'heart' }
      });
      toast.success('Wellness check-in notification sent to student');
    } catch (error) {
      console.error('Error sending notification:', error);
      toast.error('Failed to send notification');
    } finally {
      setSendingId(null);
    }
  };

  const filteredAlerts = alerts.filter(alert => {
    if (filter === 'high') return alert.priority === 'high';
    if (filter === 'medium') return alert.priority === 'medium';
    return true;
  });

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
              <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-2">At-Risk Students</h1>
              <p className="text-gray-500 dark:text-gray-400">
                Students who may need immediate attention or support
              </p>
            </div>

            <div className="grid lg:grid-cols-3 gap-4 mb-6">
              <Card className="text-center bg-red-50 dark:bg-red-900/20">
                <p className="text-3xl font-bold text-red-600">{alerts.filter(a => a.priority === 'high').length}</p>
                <p className="text-sm text-red-600">High Priority Alerts</p>
              </Card>
              <Card className="text-center bg-yellow-50 dark:bg-yellow-900/20">
                <p className="text-3xl font-bold text-yellow-600">{alerts.filter(a => a.priority === 'medium').length}</p>
                <p className="text-sm text-yellow-600">Medium Priority Alerts</p>
              </Card>
              <Card className="text-center">
                <p className="text-3xl font-bold text-gray-800 dark:text-white">{alerts.length}</p>
                <p className="text-sm text-gray-500">Total At-Risk Students</p>
              </Card>
            </div>

            <div className="flex gap-2 mb-6">
              {[
                { key: 'all', label: 'All Alerts' },
                { key: 'high', label: 'High Priority' },
                { key: 'medium', label: 'Medium Priority' }
              ].map(f => (
                <button
                  key={f.key}
                  onClick={() => setFilter(f.key)}
                  className={`px-4 py-2 rounded-lg ${
                    filter === f.key
                      ? 'bg-primary dark:bg-primary text-white'
                      : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>

            {filteredAlerts.length > 0 ? (
              <div className="space-y-4">
                {filteredAlerts.map((alert, index) => (
                  <Card key={index} className={`border-l-4 ${alert.priority === 'high' ? 'border-l-red-500' : 'border-l-yellow-500'}`}>
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-4">
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                          alert.priority === 'high' ? 'bg-red-100 dark:bg-red-900 text-red-500' : 'bg-yellow-100 dark:bg-yellow-900 text-yellow-500'
                        }`}>
                          {getTypeIcon(alert.type)}
                        </div>
                        <div>
                          <div className="flex items-center space-x-2 mb-1">
                            <span className="font-semibold text-gray-800 dark:text-white">
                              {alert.studentName || 'Unknown Student'}
                            </span>
                            <span className={`px-2 py-0.5 rounded text-xs font-medium ${getPriorityColor(alert.priority)}`}>
                              {alert.priority?.toUpperCase()}
                            </span>
                          </div>
                          <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
                            {alert.studentEmail}
                          </p>
                          {alert.department && (
                            <p className="text-[10px] uppercase font-bold text-primary dark:text-primary mb-2 inline-block bg-primary/10 px-2 py-0.5 rounded-full">
                              {alert.program} • {alert.department} • Y{alert.yearOfStudy}
                            </p>
                          )}
                          <div className="flex items-center space-x-4 text-sm">
                            <span className="px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded">
                              {getTypeLabel(alert.type)}
                            </span>
                            {alert.quizType && (
                              <span className="text-gray-600 dark:text-gray-400">
                                {alert.quizType}: Score {alert.score}
                              </span>
                            )}
                            {alert.avgMood && (
                              <span className="text-gray-600 dark:text-gray-400">
                                Avg Mood: {alert.avgMood}
                              </span>
                            )}
                          </div>
                          {alert.content && (
                            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400 italic">
                              "{alert.content}..."
                            </p>
                          )}
                          {alert.recentMoods && (
                            <div className="mt-2 flex space-x-1">
                              {alert.recentMoods.map((mood, i) => (
                                <span key={i} className="text-lg">
                                  {mood === 1 ? '😢' : mood === 2 ? '😔' : mood === 3 ? '😐' : mood === 4 ? '🙂' : '😄'}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex flex-col space-y-2">
                        <Button 
                          size="sm" 
                          variant="secondary"
                          onClick={() => handleSendWellnessCheck(alert.studentId, alert.studentName)}
                          disabled={sendingId === alert.studentId}
                          icon={sendingId === alert.studentId ? null : Send}
                        >
                          {sendingId === alert.studentId ? 'Sending...' : 'Notify Student'}
                        </Button>
                        <Button 
                          size="sm" 
                          variant="ghost"
                          onClick={() => navigate('/counsellor/students', { state: { selectStudentId: alert.studentId } })}
                        >
                          View Profile
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            ) : (
              <Card className="text-center py-12">
                <AlertTriangle className="w-16 h-16 mx-auto mb-4 text-green-500" />
                <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-2">All Clear!</h3>
                <p className="text-gray-500 dark:text-gray-400">
                  No at-risk students detected at this time.
                </p>
              </Card>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}


