import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/common/Navbar';
import Sidebar from '../components/common/Sidebar';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import { useApp } from '../context/AppContext';
import { useToast } from '../context/ToastContext';
import { userAPI, moodAPI, quizAPI, journalAPI, appointmentAPI, availabilityAPI, adminAPI } from '../services/api';
import { 
  User, Mail, Shield, Calendar, Trophy, Flame, Target, BookOpen, 
  Edit2, Save, X, Lock, Star, Award, MessageSquare, Users, 
  Briefcase, Languages, CheckCircle, Camera, Terminal, ShieldCheck, 
  UserCheck, AlertTriangle, Megaphone, ChevronRight, FileText 
} from 'lucide-react';

export default function Profile() {
  const { user, updateUser, isCounsellor, isAdmin } = useApp();
  const toast = useToast();
  const [stats, setStats] = useState({
    moodEntries: 0,
    quizzes: 0,
    journals: 0,
    currentStreak: 0,
    longestStreak: 0
  });
  const [counsellorStats, setCounsellorStats] = useState({
    totalSessions: 0,
    avgRating: 0,
    totalReviews: 0,
    activeStudents: 0
  });
  const [adminStats, setAdminStats] = useState({
    totalUsers: 0,
    totalStudents: 0,
    totalCounsellors: 0,
    activeAlerts: 0,
    pendingResources: 0
  });
  const [counsellorReviews, setCounsellorReviews] = useState([]);
  const [achievements, setAchievements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [editForm, setEditForm] = useState({ 
    name: '', 
    email: '', 
    currentPassword: '', 
    newPassword: '',
    bio: '',
    specialization: '',
    experience: '',
    availabilityStatus: 'available',
    avatar: '',
    program: '',
    department: '',
    yearOfStudy: '',
    section: '',
    universityRollNo: ''
  });
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    fetchStats();
  }, [user]);

  useEffect(() => {
    if (user) {
      setEditForm({ 
        name: user.name || '', 
        email: user.email || '', 
        currentPassword: '', 
        newPassword: '',
        bio: user.bio || '',
        specialization: user.specialization || '',
        experience: user.experience || '',
        availabilityStatus: user.availabilityStatus || 'available',
        avatar: user.avatar || '',
        program: user.program || '',
        department: user.department || '',
        yearOfStudy: user.yearOfStudy || '',
        section: user.section || '',
        universityRollNo: user.universityRollNo || ''
      });
    }
  }, [user]);

  const fetchStats = async () => {
    if (!user?._id) return;
    try {
      if (isAdmin) {
        const { data } = await adminAPI.getStats();
        if (data && data.overview) {
          setAdminStats({
            totalUsers: data.overview.totalUsers || 0,
            totalStudents: data.overview.totalStudents || 0,
            totalCounsellors: data.overview.totalCounsellors || 0,
            activeAlerts: data.activeAlerts || 0,
            pendingResources: data.pendingResources || 0
          });
        }
      } else if (isCounsellor) {
        const apptRes = await appointmentAPI.getByCounsellor(user._id);
        const apps = apptRes?.data || [];
        const reviews = apps.filter(a => a.rating && a.review);
        const uniqueStudents = new Set(apps.map(a => a.studentId?._id)).size;

        setCounsellorStats({
          totalSessions: apps.filter(a => a.status === 'completed').length,
          avgRating: user.rating || 0,
          totalReviews: reviews.length,
          activeStudents: uniqueStudents
        });
        setCounsellorReviews(reviews);
      } else {
        const [moodRes, quizRes, journalRes, streakRes] = await Promise.all([
          moodAPI.getAll(user._id),
          quizAPI.getAll(user._id),
          journalAPI.getAll(user._id),
          moodAPI.getStreak(user._id)
        ]);
        
        const moodEntries = moodRes?.data || [];
        const longestStreak = moodEntries.reduce((max, entry) => Math.max(max, entry.streak || 0), 0);
        
        setStats({
          moodEntries: moodEntries.length,
          quizzes: quizRes?.data?.length || 0,
          journals: journalRes?.length || 0,
          currentStreak: streakRes?.data?.streak || 0,
          longestStreak
        });
        
        const earnedAchievements = [];
        if (moodEntries.length >= 1) earnedAchievements.push({ id: 'first_mood', name: 'First Step', icon: '🎯', desc: 'Logged your first mood' });
        if (streakRes?.data?.streak >= 7) earnedAchievements.push({ id: 'week_streak', name: 'Week Warrior', icon: '🔥', desc: '7-day mood streak' });
        if (quizRes?.data?.length >= 5) earnedAchievements.push({ id: 'quiz_master', name: 'Quiz Master', icon: '🏆', desc: 'Completed 5 quizzes' });
        if (journalRes?.length >= 10) earnedAchievements.push({ id: 'journal_writer', name: 'Journal Master', icon: '📝', desc: '10 journal entries' });
        if (moodEntries.length >= 30) earnedAchievements.push({ id: 'monthly', name: 'Monthly Tracker', icon: '⭐', desc: '30 days of tracking' });
        
        setAchievements(earnedAchievements);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        toast.error('Image size should be less than 2MB');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setEditForm(prev => ({ ...prev, avatar: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
    setUpdating(true);
    try {
      if (editForm.newPassword && editForm.newPassword.length < 6) {
        toast.error('Password must be at least 6 characters');
        return;
      }

      const updateData = { 
        name: editForm.name, 
        email: editForm.email,
        bio: editForm.bio,
        specialization: editForm.specialization,
        experience: editForm.experience,
        availabilityStatus: editForm.availabilityStatus,
        avatar: editForm.avatar,
        program: editForm.program,
        department: editForm.department,
        yearOfStudy: editForm.yearOfStudy,
        section: editForm.section,
        universityRollNo: editForm.universityRollNo
      };
      
      if (editForm.newPassword) {
        updateData.password = editForm.newPassword;
        updateData.currentPassword = editForm.currentPassword;
      }

      const { data } = await userAPI.update(user._id, updateData);
      updateUser(data);
      setEditing(false);
      setEditForm({ ...editForm, currentPassword: '', newPassword: '' });
      toast.success('Profile updated successfully');
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Failed to update profile');
    } finally {
      setUpdating(false);
    }
  };

  const cancelEdit = () => {
    setEditForm({ 
      name: user.name, 
      email: user.email, 
      currentPassword: '', 
      newPassword: '',
      bio: user.bio || '',
      specialization: user.specialization || '',
      experience: user.experience || '',
      availabilityStatus: user.availabilityStatus || 'available',
      avatar: user.avatar || '',
      program: user.program || '',
      department: user.department || '',
      yearOfStudy: user.yearOfStudy || '',
      section: user.section || '',
      universityRollNo: user.universityRollNo || ''
    });
    setEditing(false);
  };

  const allAchievements = [
    { id: 'first_mood', name: 'First Step', icon: '🎯', desc: 'Log your first mood' },
    { id: 'week_streak', name: 'Week Warrior', icon: '🔥', desc: '7-day mood streak' },
    { id: 'quiz_master', name: 'Quiz Master', icon: '🏆', desc: 'Complete 5 quizzes' },
    { id: 'journal_writer', name: 'Journal Master', icon: '📝', desc: '10 journal entries' },
    { id: 'monthly', name: 'Monthly Tracker', icon: '⭐', desc: '30 days of tracking' },
    { id: 'healthy', name: 'Wellness Champion', icon: '💪', desc: 'Minimal symptoms on a quiz' }
  ];

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
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-2">Your Profile</h1>
                <p className="text-gray-500 dark:text-gray-400">View and manage your account</p>
              </div>
              {!editing && (
                <Button onClick={() => setEditing(true)} variant="secondary" icon={Edit2}>
                  Edit Profile
                </Button>
              )}
            </div>

            <Card className="mb-6">
              <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
                <div className="relative group">
                  <div className="w-24 h-24 bg-gradient-to-br from-primary to-accent rounded-2xl flex items-center justify-center overflow-hidden shadow-lg border-2 border-white dark:border-gray-700">
                    {editForm.avatar || user?.avatar ? (
                      <img 
                        src={editing ? editForm.avatar : user.avatar} 
                        alt="Profile" 
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-4xl text-white font-bold">
                        {user?.name?.charAt(0).toUpperCase()}
                      </span>
                    )}
                  </div>
                  {editing && (
                    <label className="absolute inset-0 flex items-center justify-center bg-black/40 text-white rounded-2xl cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                      <Camera className="w-6 h-6" />
                      <input 
                        type="file" 
                        className="hidden" 
                        accept="image/*"
                        onChange={handleImageChange}
                      />
                    </label>
                  )}
                </div>
                <div className="flex-1 text-center md:text-left">
                  {editing ? (
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Name</label>
                        <input
                          type="text"
                          value={editForm.name}
                          onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                          className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-800 dark:text-white"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email</label>
                        <input
                          type="email"
                          value={editForm.email}
                          onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                          className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-800 dark:text-white"
                        />
                      </div>

                      {user?.role === 'student' && (
                        <>
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Program</label>
                              <select
                                value={editForm.program}
                                onChange={(e) => setEditForm({ ...editForm, program: e.target.value })}
                                className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-800 dark:text-white"
                              >
                                <option value="">Select Program</option>
                                <option value="B.Tech">B.Tech</option>
                                <option value="M.Tech">M.Tech</option>
                                <option value="MBA">MBA</option>
                                <option value="MCA">MCA</option>
                                <option value="B.Sc">B.Sc</option>
                                <option value="Ph.D">Ph.D</option>
                              </select>
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Department</label>
                              <select
                                value={editForm.department}
                                onChange={(e) => setEditForm({ ...editForm, department: e.target.value })}
                                className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-800 dark:text-white"
                              >
                                <option value="">Select Dept</option>
                                <option value="Computer Science">Computer Science</option>
                                <option value="Computer Application">Computer Application</option>
                                <option value="BCA">BCA</option>
                                <option value="Mechanical">Mechanical</option>
                                <option value="Electrical">Electrical</option>
                                <option value="Business">Business</option>
                                <option value="Psychology">Psychology</option>
                              </select>
                            </div>
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Year</label>
                              <select
                                value={editForm.yearOfStudy}
                                onChange={(e) => setEditForm({ ...editForm, yearOfStudy: e.target.value })}
                                className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-800 dark:text-white"
                              >
                                <option value="">Select Year</option>
                                <option value="1">1st Year</option>
                                <option value="2">2nd Year</option>
                                {!['M.Tech', 'MBA', 'MCA'].includes(editForm.program) && (
                                  <>
                                    <option value="3">3rd Year</option>
                                    <option value="4">4th Year (Final)</option>
                                  </>
                                )}
                              </select>
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Section</label>
                              <input
                                type="text"
                                value={editForm.section}
                                onChange={(e) => setEditForm({ ...editForm, section: e.target.value.toUpperCase() })}
                                placeholder="e.g. D2421"
                                maxLength="10"
                                className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-800 dark:text-white"
                              />
                            </div>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">University Roll Number</label>
                            <input
                              type="text"
                              value={editForm.universityRollNo}
                              onChange={(e) => setEditForm({ ...editForm, universityRollNo: e.target.value })}
                              placeholder="e.g. 21CS01A"
                              className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-800 dark:text-white"
                            />
                          </div>
                        </>
                      )}

                      {isCounsellor && (
                        <>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Specialization</label>
                            <input
                              type="text"
                              value={editForm.specialization}
                              onChange={(e) => setEditForm({ ...editForm, specialization: e.target.value })}
                              placeholder="e.g. Clinical Psychology, Stress Management"
                              className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-800 dark:text-white"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Experience</label>
                            <input
                              type="text"
                              value={editForm.experience}
                              onChange={(e) => setEditForm({ ...editForm, experience: e.target.value })}
                              placeholder="e.g. 5+ Years"
                              className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-800 dark:text-white"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Status</label>
                            <select
                              value={editForm.availabilityStatus}
                              onChange={(e) => setEditForm({ ...editForm, availabilityStatus: e.target.value })}
                              className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-800 dark:text-white"
                            >
                              <option value="available">Available</option>
                              <option value="busy">Busy</option>
                              <option value="offline">Offline</option>
                            </select>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Bio</label>
                            <textarea
                              value={editForm.bio}
                              onChange={(e) => setEditForm({ ...editForm, bio: e.target.value })}
                              rows={4}
                              placeholder="Tell students about your expertise and approach..."
                              className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-800 dark:text-white resize-none"
                            />
                          </div>
                        </>
                      )}

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">New Password (optional)</label>
                        <input
                          type="password"
                          value={editForm.newPassword}
                          onChange={(e) => setEditForm({ ...editForm, newPassword: e.target.value })}
                          placeholder="Leave blank to keep current password"
                          className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-800 dark:text-white"
                        />
                      </div>
                      {editForm.newPassword && (
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Current Password (required to change)</label>
                          <input
                            type="password"
                            value={editForm.currentPassword}
                            onChange={(e) => setEditForm({ ...editForm, currentPassword: e.target.value })}
                            className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-800 dark:text-white"
                          />
                        </div>
                      )}
                      <div className="flex space-x-3">
                        <Button onClick={handleSave} icon={Save} disabled={updating}>
                          {updating ? 'Saving...' : 'Save Changes'}
                        </Button>
                        <Button onClick={cancelEdit} variant="secondary" icon={X}>
                          Cancel
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="flex items-center justify-center md:justify-start gap-3 mb-2">
                        <h2 className="text-2xl font-bold text-gray-800 dark:text-white">{user?.name}</h2>
                        {isCounsellor && (
                          <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                            user.availabilityStatus === 'busy' 
                              ? 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400' 
                              : 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400'
                          }`}>
                            {user.availabilityStatus || 'Available'}
                          </span>
                        )}
                      </div>
                      <p className="text-gray-500 dark:text-gray-400 flex items-center justify-center md:justify-start gap-2 mt-1">
                        <Mail className="w-4 h-4" /> {user?.email}
                      </p>
                      <div className="flex items-center justify-center md:justify-start gap-2 mt-3">
                        <span className={`px-3 py-1 rounded-full text-sm font-medium capitalize ${
                          user?.role === 'admin' ? 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300' :
                          user?.role === 'counsellor' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300' :
                          'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
                        }`}>
                          <Shield className="w-4 h-4 inline mr-1" />
                          {user?.role}
                        </span>
                        {isCounsellor && user.specialization && (
                          <span className="px-3 py-1 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 rounded-full text-sm font-medium">
                            <Award className="w-4 h-4 inline mr-1" />
                            {user.specialization}
                          </span>
                        )}
                      </div>
                      {isCounsellor && user.bio && (
                        <p className="mt-4 text-sm text-gray-600 dark:text-gray-400 italic line-clamp-3">
                          "{user.bio}"
                        </p>
                      )}
                    </>
                  )}
                </div>
              </div>
            </Card>

            {isAdmin ? (
              <div className="space-y-6">
                <div className="grid lg:grid-cols-4 gap-4">
                  <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm text-center">
                    <Users className="w-8 h-8 text-blue-500 mx-auto mb-2" />
                    <p className="text-2xl font-bold text-gray-800 dark:text-white">{adminStats.totalUsers}</p>
                    <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold">Total Users</p>
                  </div>
                  <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm text-center">
                    <UserCheck className="w-8 h-8 text-green-500 mx-auto mb-2" />
                    <p className="text-2xl font-bold text-gray-800 dark:text-white">{adminStats.totalStudents}</p>
                    <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold">Students</p>
                  </div>
                  <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm text-center">
                    <Briefcase className="w-8 h-8 text-purple-500 mx-auto mb-2" />
                    <p className="text-2xl font-bold text-gray-800 dark:text-white">{adminStats.totalCounsellors}</p>
                    <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold">Counsellors</p>
                  </div>
                  <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm text-center">
                    <AlertTriangle className="w-8 h-8 text-red-500 mx-auto mb-2" />
                    <p className="text-2xl font-bold text-gray-800 dark:text-white">{adminStats.activeAlerts}</p>
                    <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold">Active Alerts</p>
                  </div>
                </div>

                <div className="grid lg:grid-cols-2 gap-6">
                  <Card title="System Overview" icon={ShieldCheck}>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
                        <div className="flex items-center space-x-3">
                          <Terminal className="w-5 h-5 text-gray-400" />
                          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">System Status</span>
                        </div>
                        <span className="px-2 py-1 bg-green-100 text-green-700 text-[10px] font-bold uppercase rounded-md">Healthy</span>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
                        <div className="flex items-center space-x-3">
                          <Shield className="w-5 h-5 text-gray-400" />
                          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Admin Privileges</span>
                        </div>
                        <span className="px-2 py-1 bg-purple-100 text-purple-700 text-[10px] font-bold uppercase rounded-md">Full Access</span>
                      </div>
                      <div className="pt-4">
                         <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Management Shortcuts</h4>
                         <div className="grid grid-cols-2 gap-2">
                            <Link to="/admin/users" className="p-3 text-center bg-primary/5 hover:bg-primary/10 text-primary rounded-xl transition-colors text-sm font-semibold">
                               Manage Users
                            </Link>
                            <Link to="/admin/alerts" className="p-3 text-center bg-red-50 hover:bg-red-100 text-red-600 rounded-xl transition-colors text-sm font-semibold">
                               View Alerts
                            </Link>
                         </div>
                      </div>
                    </div>
                  </Card>

                  <Card title="Quick Management" icon={Settings}>
                    <div className="space-y-4">
                       <p className="text-sm text-gray-500">As an administrator, you have full control over the platform's resources, users, and safety protocols.</p>
                       <div className="space-y-2">
                          <div className="p-4 border border-gray-100 dark:border-gray-700 rounded-2xl hover:border-primary transition-colors group cursor-pointer">
                             <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-3">
                                   <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg group-hover:bg-blue-100">
                                      <FileText className="w-5 h-5 text-blue-500" />
                                   </div>
                                   <div>
                                      <p className="text-sm font-bold text-gray-800 dark:text-white">Content Moderation</p>
                                      <p className="text-xs text-gray-500">Review flagged posts and comments</p>
                                   </div>
                                </div>
                                <ChevronRight className="w-4 h-4 text-gray-400" />
                             </div>
                          </div>
                          <div className="p-4 border border-gray-100 dark:border-gray-700 rounded-2xl hover:border-primary transition-colors group cursor-pointer">
                             <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-3">
                                   <div className="p-2 bg-orange-50 dark:bg-orange-900/20 rounded-lg group-hover:bg-orange-100">
                                      <Megaphone className="w-5 h-5 text-orange-500" />
                                   </div>
                                   <div>
                                      <p className="text-sm font-bold text-gray-800 dark:text-white">Announcements</p>
                                      <p className="text-xs text-gray-500">Broadcast updates to all users</p>
                                   </div>
                                </div>
                                <ChevronRight className="w-4 h-4 text-gray-400" />
                             </div>
                          </div>
                       </div>
                    </div>
                  </Card>
                </div>
              </div>
            ) : isCounsellor ? (
              <div className="space-y-6">
                <div className="grid lg:grid-cols-4 gap-4">
                  <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm text-center">
                    <CheckCircle className="w-8 h-8 text-green-500 mx-auto mb-2" />
                    <p className="text-2xl font-bold text-gray-800 dark:text-white">{counsellorStats.totalSessions}</p>
                    <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold">Sessions</p>
                  </div>
                  <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm text-center">
                    <Star className="w-8 h-8 text-yellow-500 mx-auto mb-2 fill-current" />
                    <p className="text-2xl font-bold text-gray-800 dark:text-white">{counsellorStats.avgRating}</p>
                    <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold">Rating</p>
                  </div>
                  <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm text-center">
                    <MessageSquare className="w-8 h-8 text-blue-500 mx-auto mb-2" />
                    <p className="text-2xl font-bold text-gray-800 dark:text-white">{counsellorStats.totalReviews}</p>
                    <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold">Reviews</p>
                  </div>
                  <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm text-center">
                    <Users className="w-8 h-8 text-purple-500 mx-auto mb-2" />
                    <p className="text-2xl font-bold text-gray-800 dark:text-white">{counsellorStats.activeStudents}</p>
                    <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold">Students</p>
                  </div>
                </div>

                <div className="grid lg:grid-cols-2 gap-6">
                  <Card title="Expertise & Bio" icon={Briefcase}>
                    <div className="space-y-4">
                      <div>
                        <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Professional Summary</h4>
                        <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                          {user.bio || "No bio added yet. Add a professional bio to help students know you better."}
                        </p>
                      </div>
                      <div className="pt-4 border-t border-gray-100 dark:border-gray-700">
                        <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Core Expertise</h4>
                        <div className="flex flex-wrap gap-2">
                          {user.specialization?.split(',').map((spec, i) => (
                            <span key={i} className="px-3 py-1 bg-primary/10 text-primary dark:bg-primary/20 dark:text-primary rounded-full text-xs font-semibold">
                              {spec.trim()}
                            </span>
                          )) || <span className="text-xs text-gray-500 italic">No specializations added</span>}
                        </div>
                      </div>
                      <div className="pt-4 border-t border-gray-100 dark:border-gray-700 flex justify-between items-center">
                         <div>
                            <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Experience</h4>
                            <p className="text-sm font-semibold text-gray-800 dark:text-white">{user.experience || "Not specified"}</p>
                         </div>
                         <div>
                            <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1 text-right">Language</h4>
                            <p className="text-sm font-semibold text-gray-800 dark:text-white text-right">English, Hindi</p>
                         </div>
                      </div>
                    </div>
                  </Card>

                  <Card title="Recent Student Feedback" icon={MessageSquare}>
                    <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
                      {counsellorReviews.length > 0 ? (
                        counsellorReviews.map((rev, i) => (
                          <div key={i} className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-2xl border border-gray-100 dark:border-gray-700">
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center space-x-2">
                                <div className="w-8 h-8 rounded-full bg-accent/20 flex items-center justify-center text-accent text-xs font-bold">
                                  {rev.studentId?.name?.charAt(0) || 'S'}
                                </div>
                                <span className="text-sm font-bold text-gray-800 dark:text-white">{rev.studentId?.name || "Student"}</span>
                              </div>
                              <div className="flex text-yellow-500">
                                {[...Array(5)].map((_, idx) => (
                                  <Star key={idx} className={`w-3 h-3 ${idx < rev.rating ? "fill-current" : "text-gray-300"}`} />
                                ))}
                              </div>
                            </div>
                            <p className="text-sm text-gray-600 dark:text-gray-400 italic">"{rev.review}"</p>
                            <p className="text-[10px] text-gray-400 mt-2">{new Date(rev.date || Date.now()).toLocaleDateString()}</p>
                          </div>
                        ))
                      ) : (
                        <div className="text-center py-12">
                          <MessageSquare className="w-12 h-12 text-gray-300 mx-auto mb-3 opacity-50" />
                          <p className="text-gray-500 text-sm">No reviews yet.</p>
                        </div>
                      )}
                    </div>
                  </Card>
                </div>
              </div>
            ) : (
              <>
                <div className="grid lg:grid-cols-2 gap-6 mb-6">
                  <Card title="Your Stats" icon={Trophy}>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center p-4 bg-orange-50 dark:bg-orange-900/20 rounded-xl">
                        <Flame className="w-8 h-8 text-orange-500 mx-auto mb-2" />
                        <p className="text-3xl font-bold text-gray-800 dark:text-white">{stats.currentStreak}</p>
                        <p className="text-sm text-gray-500">Current Streak</p>
                      </div>
                      <div className="text-center p-4 bg-purple-50 dark:bg-purple-900/20 rounded-xl">
                        <Target className="w-8 h-8 text-purple-500 mx-auto mb-2" />
                        <p className="text-3xl font-bold text-gray-800 dark:text-white">{stats.longestStreak}</p>
                        <p className="text-sm text-gray-500">Longest Streak</p>
                      </div>
                      <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
                        <p className="text-3xl font-bold text-gray-800 dark:text-white">{stats.moodEntries}</p>
                        <p className="text-sm text-gray-500">Mood Entries</p>
                      </div>
                      <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-xl">
                        <p className="text-3xl font-bold text-gray-800 dark:text-white">{stats.quizzes}</p>
                        <p className="text-sm text-gray-500">Quizzes Taken</p>
                      </div>
                      <div className="text-center p-4 bg-pink-50 dark:bg-pink-900/20 rounded-xl col-span-2">
                        <BookOpen className="w-8 h-8 text-pink-500 mx-auto mb-2" />
                        <p className="text-3xl font-bold text-gray-800 dark:text-white">{stats.journals}</p>
                        <p className="text-sm text-gray-500">Journal Entries</p>
                      </div>
                    </div>
                  </Card>

                  <Card title="Your Achievements" icon={Trophy}>
                    <div className="space-y-3">
                      {allAchievements.map(ach => {
                        const earned = achievements.find(a => a.id === ach.id);
                        return (
                          <div
                            key={ach.id}
                            className={`flex items-center space-x-3 p-3 rounded-xl ${
                              earned ? 'bg-accent/10 dark:bg-accent/20' : 'bg-gray-50 dark:bg-gray-800/50 opacity-50'
                            }`}
                          >
                            <span className="text-2xl">{ach.icon}</span>
                            <div className="flex-1">
                              <p className={`font-medium ${earned ? 'text-gray-800 dark:text-white' : 'text-gray-500'}`}>
                                {ach.name}
                              </p>
                              <p className="text-sm text-gray-500">{ach.desc}</p>
                            </div>
                            {earned && <span className="text-green-500">✓</span>}
                          </div>
                        );
                      })}
                    </div>
                  </Card>
                </div>
              </>
            )}

            <Card>
              <h3 className="font-semibold text-gray-800 dark:text-white mb-4">Account Information</h3>
              <div className="space-y-3">
                <div className="flex justify-between p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                  <span className="text-gray-500">Member Since</span>
                  <span className="text-gray-800 dark:text-white">
                    {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
                  </span>
                </div>
                <div className="flex justify-between p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                  <span className="text-gray-500">Account Type</span>
                  <span className="text-gray-800 dark:text-white capitalize">{user?.role}</span>
                </div>
                <div className="flex justify-between p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                  <span className="text-gray-500">Total Activities</span>
                  <span className="text-gray-800 dark:text-white">
                    {stats.moodEntries + stats.quizzes + stats.journals}
                  </span>
                </div>
              </div>
            </Card>

            {user?.role === 'student' && !editing && (
              <Card className="mt-6">
                <h3 className="font-semibold text-gray-800 dark:text-white mb-4">Academic Information</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                    <span className="text-xs text-gray-500 uppercase tracking-wider block mb-1">Program</span>
                    <span className="text-gray-800 dark:text-white font-medium">{user.program || 'Not set'}</span>
                  </div>
                  <div className="p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                    <span className="text-xs text-gray-500 uppercase tracking-wider block mb-1">Department</span>
                    <span className="text-gray-800 dark:text-white font-medium">{user.department || 'Not set'}</span>
                  </div>
                  <div className="p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                    <span className="text-xs text-gray-500 uppercase tracking-wider block mb-1">Year of Study</span>
                    <span className="text-gray-800 dark:text-white font-medium">
                      {user.yearOfStudy ? `${user.yearOfStudy}${user.yearOfStudy === '1' ? 'st' : user.yearOfStudy === '2' ? 'nd' : user.yearOfStudy === '3' ? 'rd' : 'th'} Year` : 'Not set'}
                    </span>
                  </div>
                  <div className="p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                    <span className="text-xs text-gray-500 uppercase tracking-wider block mb-1">Section</span>
                    <span className="text-gray-800 dark:text-white font-medium">{user.section || 'Not set'}</span>
                  </div>
                  <div className="p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg col-span-2">
                    <span className="text-xs text-gray-500 uppercase tracking-wider block mb-1">University Roll Number</span>
                    <span className="text-gray-800 dark:text-white font-medium">{user.universityRollNo || 'Not set'}</span>
                  </div>
                </div>
              </Card>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}


