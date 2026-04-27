import { useState, useEffect } from 'react';
import Navbar from '../../components/common/Navbar';
import Sidebar from '../../components/common/Sidebar';
import Card from '../../components/common/Card';
import { adminCounsellorsAPI } from '../../services/api';
import { Users, Calendar, CheckCircle, Clock, TrendingUp } from 'lucide-react';

export default function CounsellorOverview() {
  const [counsellors, setCounsellors] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCounsellors();
  }, []);

  const fetchCounsellors = async () => {
    try {
      const { data } = await adminCounsellorsAPI.getAll();
      setCounsellors(data);
    } catch (error) {
      console.error('Error fetching counsellors:', error);
    } finally {
      setLoading(false);
    }
  };

  const totalSessions = counsellors.reduce((sum, c) => sum + c.completedSessions, 0);
  const totalPending = counsellors.reduce((sum, c) => sum + c.pendingRequests, 0);
  const avgSessions = counsellors.length > 0 ? Math.round(totalSessions / counsellors.length) : 0;

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
              <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-2">Counsellor Overview</h1>
              <p className="text-gray-500 dark:text-gray-400">Monitor workload and session statistics</p>
            </div>

            <div className="grid lg:grid-cols-4 gap-4 mb-8">
              <Card className="text-center">
                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mx-auto mb-2">
                  <Users className="w-6 h-6 text-blue-500" />
                </div>
                <p className="text-3xl font-bold text-gray-800 dark:text-white">{counsellors.length}</p>
                <p className="text-sm text-gray-500">Active Counsellors</p>
              </Card>
              <Card className="text-center">
                <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mx-auto mb-2">
                  <CheckCircle className="w-6 h-6 text-green-500" />
                </div>
                <p className="text-3xl font-bold text-gray-800 dark:text-white">{totalSessions}</p>
                <p className="text-sm text-gray-500">Total Sessions</p>
              </Card>
              <Card className="text-center">
                <div className="w-12 h-12 bg-yellow-100 dark:bg-yellow-900 rounded-full flex items-center justify-center mx-auto mb-2">
                  <Clock className="w-6 h-6 text-yellow-500" />
                </div>
                <p className="text-3xl font-bold text-gray-800 dark:text-white">{totalPending}</p>
                <p className="text-sm text-gray-500">Pending Requests</p>
              </Card>
              <Card className="text-center">
                <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center mx-auto mb-2">
                  <TrendingUp className="w-6 h-6 text-purple-500" />
                </div>
                <p className="text-3xl font-bold text-gray-800 dark:text-white">{avgSessions}</p>
                <p className="text-sm text-gray-500">Avg Sessions/Counsellor</p>
              </Card>
            </div>

            <Card title="Counsellor Performance">
              <div className="space-y-4">
                {counsellors.map(counsellor => (
                  <div key={counsellor._id} className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 bg-primary/20 dark:bg-primary/20 rounded-full flex items-center justify-center">
                          <Users className="w-6 h-6 text-primary dark:text-primary" />
                        </div>
                        <div>
                          <p className="font-semibold text-gray-800 dark:text-white">{counsellor.name}</p>
                          <p className="text-sm text-gray-500">{counsellor.email}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-primary dark:text-primary">
                          {counsellor.totalAppointments}
                        </p>
                        <p className="text-sm text-gray-500">Total Bookings</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                      <div className="text-center p-3 bg-white dark:bg-gray-700 rounded-lg">
                        <p className="text-2xl font-bold text-green-500">{counsellor.completedSessions}</p>
                        <p className="text-xs text-gray-500">Completed</p>
                      </div>
                      <div className="text-center p-3 bg-white dark:bg-gray-700 rounded-lg">
                        <p className="text-2xl font-bold text-blue-500">{counsellor.confirmedSessions}</p>
                        <p className="text-xs text-gray-500">Confirmed</p>
                      </div>
                      <div className="text-center p-3 bg-white dark:bg-gray-700 rounded-lg">
                        <p className="text-2xl font-bold text-yellow-500">{counsellor.pendingRequests}</p>
                        <p className="text-xs text-gray-500">Pending</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
}


