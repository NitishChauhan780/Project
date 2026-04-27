import { useState, useEffect } from 'react';
import Navbar from '../../components/common/Navbar';
import Sidebar from '../../components/common/Sidebar';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import { announcementsAPI } from '../../services/api';
import { useApp } from '../../context/AppContext';
import { useToast } from '../../context/ToastContext';
import { Megaphone, Trash2, Pin, Clock, AlertCircle } from 'lucide-react';

export default function Announcements() {
  const { user } = useApp();
  const toast = useToast();
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ 
    title: '', 
    content: '', 
    priority: 'normal',
    targetDepartment: '',
    targetYear: ''
  });

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const fetchAnnouncements = async () => {
    try {
      const { data } = await announcementsAPI.getAll();
      setAnnouncements(data);
    } catch (error) {
      console.error('Error fetching announcements:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!formData.title.trim() || !formData.content.trim()) {
      toast.warning('Please fill in both title and message');
      return;
    }
    
    try {
      await announcementsAPI.create({
        ...formData,
        createdBy: user._id
      });
      toast.success('Announcement posted successfully');
      setFormData({ 
        title: '', 
        content: '', 
        priority: 'normal',
        targetDepartment: '',
        targetYear: ''
      });
      setShowForm(false);
      fetchAnnouncements();
    } catch (error) {
      toast.error('Error creating announcement');
      console.error('Error creating announcement:', error);
    }
  };

  const handleDelete = async (id) => {
    try {
      await announcementsAPI.delete(id);
      toast.success('Announcement removed');
      setAnnouncements(prev => prev.filter(a => a._id !== id));
    } catch (error) {
      toast.error('Error deleting announcement');
      console.error('Error deleting announcement:', error);
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
    <div className="min-h-screen bg-background-light dark:bg-background-dark transition-colors duration-300">
      <Navbar />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-4 lg:p-8 lg:ml-64">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-2">Announcements</h1>
                <p className="text-gray-500 dark:text-gray-400">Broadcast messages to all students</p>
              </div>
              <Button onClick={() => setShowForm(!showForm)} icon={Megaphone}>
                New Announcement
              </Button>
            </div>

            {showForm && (
              <Card className="mb-6">
                <h3 className="font-semibold text-gray-800 dark:text-white mb-4">Create Announcement</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Title</label>
                    <input
                      type="text"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-800 dark:text-white"
                      placeholder="Announcement title"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Message</label>
                    <textarea
                      value={formData.content}
                      onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                      rows={4}
                      className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-800 dark:text-white resize-none"
                      placeholder="Write your message here..."
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Target Department</label>
                      <select
                        value={formData.targetDepartment}
                        onChange={(e) => setFormData({ ...formData, targetDepartment: e.target.value })}
                        className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-800 dark:text-white"
                      >
                        <option value="">All Departments (Global)</option>
                        <option value="Computer Science">Computer Science</option>
                        <option value="Computer Application">Computer Application</option>
                        <option value="BCA">BCA</option>
                        <option value="Mechanical">Mechanical</option>
                        <option value="Electrical">Electrical</option>
                        <option value="Business">Business</option>
                        <option value="Psychology">Psychology</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Target Year</label>
                      <select
                        value={formData.targetYear}
                        onChange={(e) => setFormData({ ...formData, targetYear: e.target.value })}
                        className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-800 dark:text-white"
                      >
                        <option value="">All Years</option>
                        <option value="1">1st Year</option>
                        <option value="2">2nd Year</option>
                        <option value="3">3rd Year</option>
                        <option value="4">4th Year</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Priority</label>
                    <div className="flex gap-2">
                      {['normal', 'high'].map(p => (
                        <button
                          key={p}
                          onClick={() => setFormData({ ...formData, priority: p })}
                          className={`px-4 py-2 rounded-lg capitalize ${
                            formData.priority === p
                              ? 'bg-primary dark:bg-primary text-white'
                              : 'bg-gray-100 dark:bg-gray-800'
                          }`}
                        >
                          {p}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <Button onClick={handleSubmit}>Post Announcement</Button>
                    <Button onClick={() => setShowForm(false)} variant="ghost">Cancel</Button>
                  </div>
                </div>
              </Card>
            )}

            <div className="space-y-4">
              {announcements.map(ann => (
                <Card key={ann._id} className={ann.priority === 'high' ? 'border-2 border-red-300 dark:border-red-700' : ''}>
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-3">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        ann.priority === 'high' ? 'bg-red-100 dark:bg-red-900' : 'bg-accent/20'
                      }`}>
                        {ann.priority === 'high' ? (
                          <AlertCircle className="w-5 h-5 text-red-500" />
                        ) : (
                          <Megaphone className="w-5 h-5 text-accent" />
                        )}
                      </div>
                      <div>
                        <div className="flex items-center space-x-2 mb-1">
                          <h3 className="font-semibold text-gray-800 dark:text-white">{ann.title}</h3>
                          {ann.priority === 'high' && (
                            <span className="px-2 py-0.5 bg-red-100 text-red-600 dark:bg-red-900 dark:text-red-300 rounded text-xs">
                              HIGH PRIORITY
                            </span>
                          )}
                          {(ann.targetDepartment || ann.targetYear) && (
                            <span className="px-2 py-0.5 bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-300 rounded text-[10px] font-bold uppercase">
                              Target: {ann.targetDepartment || 'All Dept'} • {ann.targetYear ? `Year ${ann.targetYear}` : 'All Years'}
                            </span>
                          )}
                        </div>
                        <p className="text-gray-600 dark:text-gray-400 mb-2">{ann.content}</p>
                        <div className="flex items-center space-x-2 text-sm text-gray-500">
                          <span>{ann.createdBy?.name || 'Admin'}</span>
                          <span>•</span>
                          <span className="flex items-center">
                            <Clock className="w-4 h-4 mr-1" />
                            {new Date(ann.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => handleDelete(ann._id)}
                      className="p-2 hover:bg-red-100 dark:hover:bg-red-900 rounded-lg text-red-500"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </Card>
              ))}

              {announcements.length === 0 && (
                <Card className="text-center py-12">
                  <Megaphone className="w-16 h-16 mx-auto mb-4 text-gray-300 dark:text-gray-600" />
                  <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-2">No Announcements</h3>
                  <p className="text-gray-500 dark:text-gray-400">
                    Create your first announcement to broadcast to all students.
                  </p>
                </Card>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

