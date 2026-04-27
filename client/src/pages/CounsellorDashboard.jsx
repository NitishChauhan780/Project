import { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import Navbar from '../components/common/Navbar';
import Sidebar from '../components/common/Sidebar';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Modal from '../components/common/Modal';
import { appointmentAPI } from '../services/api';
import { Calendar, Clock, User, CheckCircle, XCircle, FileText, CalendarPlus, AlertCircle, PieChart as PieIcon } from 'lucide-react';

export default function CounsellorDashboard() {
  const { user } = useApp();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [showNotesModal, setShowNotesModal] = useState(false);
  const [sessionNotes, setSessionNotes] = useState('');
  const [followUpDate, setFollowUpDate] = useState('');
  const [referral, setReferral] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchAppointments();
  }, [user]);

  const fetchAppointments = async () => {
    if (!user?._id) return;
    try {
      const { data } = await appointmentAPI.getByCounsellor(user._id);
      setAppointments(data);
    } catch (error) {
      console.error('Error fetching appointments:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (id, status) => {
    try {
      await appointmentAPI.update(id, { status });
      fetchAppointments();
    } catch (error) {
      console.error('Update error:', error);
    }
  };

  const openNotesModal = (apt) => {
    setSelectedAppointment(apt);
    setSessionNotes(apt.sessionNotes || '');
    setFollowUpDate(apt.followUpDate ? new Date(apt.followUpDate).toISOString().split('T')[0] : '');
    setReferral(apt.referral || '');
    setShowNotesModal(true);
  };

  const saveSessionNotes = async () => {
    if (!selectedAppointment) return;
    setSaving(true);
    try {
      await appointmentAPI.update(selectedAppointment._id, {
        sessionNotes,
        followUpDate: followUpDate || undefined,
        referral,
        sharedWithStudent: false
      });
      setShowNotesModal(false);
      fetchAppointments();
    } catch (error) {
      console.error('Error saving notes:', error);
    } finally {
      setSaving(false);
    }
  };

  const todayISO = new Date().toISOString().split('T')[0];
  const todayAppointments = appointments.filter(a => {
    const aptDateISO = new Date(a.date).toISOString().split('T')[0];
    return aptDateISO === todayISO && a.status !== 'cancelled';
  });
  const pendingCount = appointments.filter(a => a.status === 'pending').length;
  const completedCount = appointments.filter(a => a.status === 'completed').length;

  // Action Items: Completed sessions without notes
  const missingNotes = appointments.filter(a => a.status === 'completed' && !a.sessionNotes);

  const COLORS = ['#0D9488', '#F59E0B', '#3B82F6', '#8B5CF6', '#EC4899', '#10B981'];

  const getStatusColor = (status) => {
    switch (status) {
      case 'confirmed': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'pending': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
      case 'completed': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
      case 'cancelled': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
      default: return 'bg-gray-100 text-gray-800';
    }
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
    <div className="min-h-screen bg-background-light dark:bg-background-dark transition-colors duration-300 pb-20 lg:pb-0">
      <Navbar />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-4 lg:p-8 lg:ml-64">
          <div className="max-w-6xl mx-auto">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-2">Counsellor Dashboard</h1>
              <p className="text-gray-500 dark:text-gray-400">
                Welcome, {user?.name}. Manage your appointments and student sessions.
              </p>
            </div>

            <div className="grid lg:grid-cols-4 gap-4 mb-8">
              <Card className="text-center bg-blue-50/50 dark:bg-blue-900/10 border-blue-100 dark:border-blue-800">
                <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mx-auto mb-2">
                  <Calendar className="w-5 h-5 text-blue-500" />
                </div>
                <p className="text-2xl font-bold text-gray-800 dark:text-white">{todayAppointments.length}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 font-medium uppercase">Today's Sessions</p>
              </Card>
              <Card className="text-center bg-yellow-50/50 dark:bg-yellow-900/10 border-yellow-100 dark:border-yellow-800">
                <div className="w-10 h-10 bg-yellow-100 dark:bg-yellow-900 rounded-full flex items-center justify-center mx-auto mb-2">
                  <Clock className="w-5 h-5 text-yellow-500" />
                </div>
                <p className="text-2xl font-bold text-gray-800 dark:text-white">{pendingCount}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 font-medium uppercase">Pending Requests</p>
              </Card>
              <Card className="text-center bg-green-50/50 dark:bg-green-900/10 border-green-100 dark:border-green-800">
                <div className="w-10 h-10 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mx-auto mb-2">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                </div>
                <p className="text-2xl font-bold text-gray-800 dark:text-white">{completedCount}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 font-medium uppercase">Completed Sessions</p>
              </Card>
              <Card className="text-center bg-red-50/50 dark:bg-red-900/10 border-red-100 dark:border-red-800">
                <div className="w-10 h-10 bg-red-100 dark:bg-red-900 rounded-full flex items-center justify-center mx-auto mb-2">
                  <AlertCircle className="w-5 h-5 text-red-500" />
                </div>
                <p className="text-2xl font-bold text-gray-800 dark:text-white">{missingNotes.length}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 font-medium uppercase">Notes Required</p>
              </Card>
            </div>

            <div className="mb-8">
               <Card title="Today's Schedule">
                  {todayAppointments.length > 0 ? (
                    <div className="space-y-4">
                      {todayAppointments.map(apt => (
                        <div key={apt._id} className="flex items-center justify-between p-3 bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm">
                           <div className="flex items-center space-x-3">
                              <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                                 <Clock className="w-5 h-5 text-primary" />
                              </div>
                              <div>
                                 <p className="font-semibold text-gray-800 dark:text-white">{apt.timeSlot}</p>
                                 <p className="text-sm text-gray-500">{apt.studentId?.name}</p>
                              </div>
                           </div>
                           <Button onClick={() => openNotesModal(apt)} size="sm" variant="outline">
                              Prepare
                           </Button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-6 text-gray-500">
                       <p>No sessions scheduled for today</p>
                    </div>
                  )}
               </Card>
            </div>

            <Card title="Appointment Management">
              {appointments.length > 0 ? (
                <div className="space-y-4">
                  {appointments.map(apt => (
                    <div key={apt._id} className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
                      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                        <div className="flex items-center space-x-4">
                          <div className="w-12 h-12 bg-primary/20 dark:bg-primary/20 rounded-full flex items-center justify-center">
                            <User className="w-6 h-6 text-primary dark:text-primary" />
                          </div>
                          <div>
                            <p className="font-semibold text-gray-800 dark:text-white">{apt.studentId?.name || 'Student'}</p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                              {new Date(apt.date).toLocaleDateString('en-US', {
                                weekday: 'long', month: 'short', day: 'numeric', year: 'numeric'
                              })} at {apt.timeSlot}
                            </p>
                            {apt.studentId?.department && (
                              <p className="text-[10px] uppercase font-bold text-primary dark:text-primary mt-1 inline-block bg-primary/10 px-2 py-0.5 rounded-full">
                                {apt.studentId.department} • Year {apt.studentId.yearOfStudy}
                              </p>
                            )}
                            {apt.studentId?.email && (
                              <p className="text-xs text-gray-400 mt-1">{apt.studentId.email}</p>
                            )}
                          </div>
                        </div>
                        <div className="flex flex-wrap items-center gap-2">
                          <span className={`px-3 py-1 rounded-full text-sm ${getStatusColor(apt.status)}`}>
                            {apt.status}
                          </span>
                          
                          {apt.status === 'pending' && (
                            <div className="flex gap-2">
                              <button
                                onClick={() => handleStatusUpdate(apt._id, 'confirmed')}
                                className="p-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
                                title="Confirm"
                              >
                                <CheckCircle className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleStatusUpdate(apt._id, 'cancelled')}
                                className="p-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
                                title="Cancel"
                              >
                                <XCircle className="w-4 h-4" />
                              </button>
                            </div>
                          )}
                          
                          {apt.status === 'confirmed' && (
                            <button
                              onClick={() => handleStatusUpdate(apt._id, 'completed')}
                              className="px-3 py-1.5 bg-blue-500 text-white rounded-lg hover:bg-blue-600 text-sm"
                            >
                              Complete Session
                            </button>
                          )}
                          
                          {(apt.status === 'confirmed' || apt.status === 'completed') && (
                            <button
                              onClick={() => openNotesModal(apt)}
                              className="flex items-center space-x-1 px-3 py-1.5 bg-purple-500 text-white rounded-lg hover:bg-purple-600 text-sm"
                            >
                              <FileText className="w-4 h-4" />
                              <span>Notes</span>
                            </button>
                          )}
                        </div>
                      </div>
                      
                      {apt.sessionNotes && (
                        <div className="mt-3 p-3 bg-white dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600">
                          <p className="text-xs text-gray-500 mb-1">Session Notes:</p>
                          <p className="text-sm text-gray-700 dark:text-gray-300">{apt.sessionNotes}</p>
                          {apt.followUpDate && (
                            <p className="text-xs text-purple-600 mt-2">
                              Follow-up: {new Date(apt.followUpDate).toLocaleDateString()}
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Calendar className="w-16 h-16 mx-auto mb-4 text-gray-300 dark:text-gray-600" />
                  <p className="text-gray-500 dark:text-gray-400">No appointments scheduled</p>
                </div>
              )}
            </Card>
          </div>
        </main>
      </div>

      <Modal
        isOpen={showNotesModal}
        onClose={() => setShowNotesModal(false)}
        title={`Session Notes - ${selectedAppointment?.studentId?.name || 'Student'}`}
        size="lg"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Session Notes
            </label>
            <textarea
              value={sessionNotes}
              onChange={(e) => setSessionNotes(e.target.value)}
              rows={6}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-800 dark:text-white resize-none"
              placeholder="Document the session, key topics discussed, student concerns, and observations..."
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Follow-up Date (Optional)
            </label>
            <input
              type="date"
              value={followUpDate}
              onChange={(e) => setFollowUpDate(e.target.value)}
              className="w-full px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-800 dark:text-white"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Referral (Optional)
            </label>
            <input
              type="text"
              value={referral}
              onChange={(e) => setReferral(e.target.value)}
              className="w-full px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-800 dark:text-white"
              placeholder="Referral to psychiatrist, wellness program, etc."
            />
          </div>
          
          <div className="flex space-x-3 pt-2">
            <Button onClick={saveSessionNotes} disabled={saving} className="flex-1">
              {saving ? 'Saving...' : 'Save Notes'}
            </Button>
            <Button onClick={() => setShowNotesModal(false)} variant="ghost" className="flex-1">
              Cancel
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}


