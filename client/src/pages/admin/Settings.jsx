import { useState } from 'react';
import Navbar from '../../components/common/Navbar';
import Sidebar from '../../components/common/Sidebar';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import { useApp } from '../../context/AppContext';
import { Settings as SettingsIcon, User, Bell, Shield, Download, Database } from 'lucide-react';

export default function Settings() {
  const { user, theme, toggleTheme } = useApp();
  const [activeTab, setActiveTab] = useState('profile');

  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'data', label: 'Data & Export', icon: Database }
  ];

  return (
    <div className="min-h-screen bg-background-light dark:bg-background-dark transition-colors duration-300">
      <Navbar />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-4 lg:p-8 lg:ml-64">
          <div className="max-w-4xl mx-auto">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-2">Settings</h1>
              <p className="text-gray-500 dark:text-gray-400">Manage your account and application settings</p>
            </div>

            <div className="flex flex-col md:flex-row gap-6">
              <div className="md:w-64">
                <div className="space-y-1">
                  {tabs.map(tab => {
                    const Icon = tab.icon;
                    return (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all ${
                          activeTab === tab.id
                            ? 'bg-primary dark:bg-primary text-white'
                            : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                        }`}
                      >
                        <Icon className="w-5 h-5" />
                        <span>{tab.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="flex-1">
                {activeTab === 'profile' && (
                  <Card>
                    <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">Profile Information</h3>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Name</label>
                        <input
                          type="text"
                          value={user?.name || ''}
                          className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-800 dark:text-white"
                          readOnly
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email</label>
                        <input
                          type="email"
                          value={user?.email || ''}
                          className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-800 dark:text-white"
                          readOnly
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Role</label>
                        <input
                          type="text"
                          value={user?.role || ''}
                          className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-white capitalize"
                          readOnly
                        />
                      </div>
                      <p className="text-sm text-gray-500">Profile updates are managed by the system administrator.</p>
                    </div>
                  </Card>
                )}

                {activeTab === 'notifications' && (
                  <Card>
                    <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">Notification Preferences</h3>
                    <div className="space-y-4">
                      {[
                        { label: 'Email notifications for new forum replies', enabled: true },
                        { label: 'Appointment reminders', enabled: true },
                        { label: 'Weekly mood check-in reminders', enabled: false },
                        { label: 'New announcement alerts', enabled: true }
                      ].map((pref, i) => (
                        <div key={i} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                          <span className="text-gray-700 dark:text-gray-300">{pref.label}</span>
                          <button className={`w-12 h-6 rounded-full relative transition-colors ${pref.enabled ? 'bg-primary dark:bg-primary' : 'bg-gray-300 dark:bg-gray-600'}`}>
                            <span className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${pref.enabled ? 'right-1' : 'left-1'}`} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </Card>
                )}

                {activeTab === 'security' && (
                  <Card>
                    <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">Security Settings</h3>
                    <div className="space-y-4">
                      <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                        <p className="font-medium text-gray-800 dark:text-white mb-1">Change Password</p>
                        <p className="text-sm text-gray-500 mb-3">Last changed: Never</p>
                        <Button size="sm" variant="secondary">Update Password</Button>
                      </div>
                      <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                        <p className="font-medium text-gray-800 dark:text-white mb-1">Two-Factor Authentication</p>
                        <p className="text-sm text-gray-500 mb-3">Add an extra layer of security to your account</p>
                        <Button size="sm" variant="secondary">Enable 2FA</Button>
                      </div>
                    </div>
                  </Card>
                )}

                {activeTab === 'data' && (
                  <Card>
                    <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">Data Management</h3>
                    <div className="space-y-4">
                      <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium text-gray-800 dark:text-white">Export All Data</p>
                            <p className="text-sm text-gray-500">Download all platform data as CSV</p>
                          </div>
                          <Button size="sm" icon={Download}>Export CSV</Button>
                        </div>
                      </div>
                      <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
                        <p className="font-medium text-red-600 dark:text-red-400 mb-1">Danger Zone</p>
                        <p className="text-sm text-gray-500 mb-3">These actions are irreversible</p>
                        <Button size="sm" variant="danger">Clear All User Data</Button>
                      </div>
                    </div>
                  </Card>
                )}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}


