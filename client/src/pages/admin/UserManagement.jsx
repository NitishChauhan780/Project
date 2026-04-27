import { useState, useEffect } from 'react';
import Navbar from '../../components/common/Navbar';
import Sidebar from '../../components/common/Sidebar';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Modal from '../../components/common/Modal';
import { adminUsersAPI } from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { Users, Shield, UserX, UserCheck, Search, UserPlus, Mail, Lock, User } from 'lucide-react';

export default function UserManagement() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [filter, setFilter] = useState('all');
  const [addForm, setAddForm] = useState({ name: '', email: '', password: '', role: 'student' });
  const [addLoading, setAddLoading] = useState(false);
  const toast = useToast();

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const { data } = await adminUsersAPI.getAll();
      setUsers(data);
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = async (userId, newRole) => {
    try {
      await adminUsersAPI.updateRole(userId, newRole);
      toast.success('Role updated successfully');
      fetchUsers();
      setShowRoleModal(false);
    } catch (error) {
      toast.error('Error updating role');
      console.error('Error updating role:', error);
    }
  };

  const handleToggleStatus = async (userId, isActive) => {
    try {
      if (isActive) {
        await adminUsersAPI.deactivate(userId);
        toast.success('User deactivated');
      } else {
        await adminUsersAPI.activate(userId);
        toast.success('User activated');
      }
      fetchUsers();
    } catch (error) {
      toast.error('Error toggling status');
      console.error('Error toggling status:', error);
    }
  };

  const handleAddUser = async () => {
    if (!addForm.name.trim() || !addForm.email.trim() || !addForm.password.trim()) {
      toast.warning('Please fill in all fields');
      return;
    }
    if (addForm.password.length < 6) {
      toast.warning('Password must be at least 6 characters');
      return;
    }
    setAddLoading(true);
    try {
      await adminUsersAPI.create(addForm);
      toast.success(`${addForm.role.charAt(0).toUpperCase() + addForm.role.slice(1)} account created successfully`);
      setShowAddModal(false);
      setAddForm({ name: '', email: '', password: '', role: 'student' });
      fetchUsers();
    } catch (error) {
      const msg = error.response?.data?.error || 'Error creating user';
      toast.error(msg);
    } finally {
      setAddLoading(false);
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(search.toLowerCase()) ||
      user.email.toLowerCase().includes(search.toLowerCase());
    const matchesFilter = filter === 'all' || user.role === filter;
    return matchesSearch && matchesFilter;
  });

  const getRoleColor = (role) => {
    switch (role) {
      case 'admin': return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300';
      case 'counsellor': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
      default: return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
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
          <div className="max-w-6xl mx-auto">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-2">User Management</h1>
                <p className="text-gray-500 dark:text-gray-400">Manage users, roles, and account status</p>
              </div>
              <Button onClick={() => setShowAddModal(true)} icon={UserPlus}>
                Add User
              </Button>
            </div>

            <div className="flex flex-col md:flex-row gap-4 mb-6">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search by name or email..."
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-800 dark:text-white"
                />
              </div>
              <div className="flex gap-2">
                {['all', 'student', 'counsellor', 'admin'].map(role => (
                  <button
                    key={role}
                    onClick={() => setFilter(role)}
                    className={`px-4 py-2 rounded-lg capitalize ${
                      filter === role
                        ? 'bg-primary dark:bg-primary text-white'
                        : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300'
                    }`}
                  >
                    {role}
                  </button>
                ))}
              </div>
            </div>

            <Card>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200 dark:border-gray-700">
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600 dark:text-gray-400">User</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600 dark:text-gray-400">Role</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600 dark:text-gray-400">Joined</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600 dark:text-gray-400">Status</th>
                      <th className="text-right py-3 px-4 text-sm font-semibold text-gray-600 dark:text-gray-400">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredUsers.map(user => (
                      <tr key={user._id} className="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/50">
                        <td className="py-4 px-4">
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-primary/20 dark:bg-primary/20 rounded-full flex items-center justify-center">
                              <Users className="w-5 h-5 text-primary dark:text-primary" />
                            </div>
                            <div>
                              <p className="font-medium text-gray-800 dark:text-white">{user.name}</p>
                              <p className="text-sm text-gray-500">{user.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <span className={`px-3 py-1 rounded-full text-sm font-medium capitalize ${getRoleColor(user.role)}`}>
                            {user.role}
                          </span>
                        </td>
                        <td className="py-4 px-4 text-sm text-gray-500">
                          {new Date(user.createdAt).toLocaleDateString()}
                        </td>
                        <td className="py-4 px-4">
                          <span className={`px-3 py-1 rounded-full text-sm ${
                            user.isActive !== false
                              ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
                              : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
                          }`}>
                            {user.isActive !== false ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td className="py-4 px-4">
                          <div className="flex justify-end space-x-2">
                            <Button
                              onClick={() => { setSelectedUser(user); setShowRoleModal(true); }}
                              size="sm"
                              variant="ghost"
                              icon={Shield}
                            >
                              Change Role
                            </Button>
                            <Button
                              onClick={() => handleToggleStatus(user._id, user.isActive !== false)}
                              size="sm"
                              variant="ghost"
                              icon={user.isActive !== false ? UserX : UserCheck}
                            >
                              {user.isActive !== false ? 'Deactivate' : 'Activate'}
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>

            {/* Change Role Modal */}
            <Modal isOpen={showRoleModal} onClose={() => setShowRoleModal(false)} title={`Change Role - ${selectedUser?.name}`}>
              <div className="space-y-3">
                {['student', 'counsellor', 'admin'].map(role => (
                  <button
                    key={role}
                    onClick={() => handleRoleChange(selectedUser._id, role)}
                    className={`w-full p-4 rounded-xl text-left transition-all ${
                      selectedUser?.role === role
                        ? 'bg-primary dark:bg-primary text-white'
                        : 'bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700'
                    }`}
                  >
                    <p className="font-semibold capitalize">{role}</p>
                    <p className={`text-sm ${selectedUser?.role === role ? 'text-white/70' : 'text-gray-500'}`}>
                      {role === 'student' && 'Access to mood tracking, quizzes, journal, chat, resources, forum, wellness'}
                      {role === 'counsellor' && 'Manage appointments and view student progress'}
                      {role === 'admin' && 'Full access to analytics, user management, and system settings'}
                    </p>
                  </button>
                ))}
              </div>
            </Modal>

            {/* Add User Modal */}
            <Modal isOpen={showAddModal} onClose={() => { setShowAddModal(false); setAddForm({ name: '', email: '', password: '', role: 'student' }); }} title="Add New User">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Full Name</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      value={addForm.name}
                      onChange={(e) => setAddForm({ ...addForm, name: e.target.value })}
                      className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-800 dark:text-white"
                      placeholder="John Doe"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="email"
                      value={addForm.email}
                      onChange={(e) => setAddForm({ ...addForm, email: e.target.value })}
                      className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-800 dark:text-white"
                      placeholder="user@mindbridge.edu"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="password"
                      value={addForm.password}
                      onChange={(e) => setAddForm({ ...addForm, password: e.target.value })}
                      className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-800 dark:text-white"
                      placeholder="Min 6 characters"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Role</label>
                  <div className="flex gap-2">
                    {['student', 'counsellor', 'admin'].map(role => (
                      <button
                        key={role}
                        onClick={() => setAddForm({ ...addForm, role })}
                        className={`flex-1 px-4 py-2.5 rounded-lg capitalize font-medium transition-all ${
                          addForm.role === role
                            ? 'bg-primary dark:bg-primary text-white shadow-md'
                            : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                        }`}
                      >
                        {role}
                      </button>
                    ))}
                  </div>
                </div>
                <Button onClick={handleAddUser} disabled={addLoading} className="w-full" icon={UserPlus}>
                  {addLoading ? 'Creating...' : 'Create User'}
                </Button>
              </div>
            </Modal>
          </div>
        </main>
      </div>
    </div>
  );
}


