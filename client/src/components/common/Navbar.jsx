import { Link } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { Brain, Sun, Moon, Phone, Menu, X, Bell, User, Settings, LogOut, ChevronDown } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import CrisisAlert from './CrisisAlert';
import { notificationAPI } from '../../services/api';

export default function Navbar() {
  const { user, theme, toggleTheme, logout } = useApp();
  const [showCrisis, setShowCrisis] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setUserMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (user?._id) {
      fetchUnreadCount();
      const interval = setInterval(fetchUnreadCount, 60000);
      return () => clearInterval(interval);
    }
  }, [user]);

  const fetchUnreadCount = async () => {
    if (!user?._id) return;
    try {
      const { data } = await notificationAPI.getUnreadCount(user._id);
      setUnreadCount(data.count);
    } catch (error) {
      console.error('Error fetching unread count:', error);
    }
  };

  if (!user) return null;

  return (
    <>
      <nav className="bg-card-light dark:bg-card-dark border-b border-gray-100 dark:border-gray-800 sticky top-0 z-50 transition-all duration-300">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <Link to={user.role === 'admin' ? '/admin' : user.role === 'counsellor' ? '/counsellor' : '/dashboard'} className="flex items-center space-x-3 group">
              <div className="w-10 h-10 bg-gradient-to-br from-primary to-primary-400 rounded-xl flex items-center justify-center shadow-md group-hover:shadow-glow transition-all">
                <Brain className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-800 dark:text-white">MindBridge</span>
            </Link>

            <div className="hidden md:flex items-center space-x-2">
              <Link
                to="/notifications"
                className="relative p-2.5 rounded-xl hover:bg-surface-light dark:hover:bg-surface-dark transition-all"
              >
                <Bell className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                {unreadCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-danger text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </Link>

              <button
                onClick={() => setShowCrisis(true)}
                className="flex items-center space-x-2 px-4 py-2 bg-danger/10 text-danger rounded-xl hover:bg-danger/20 transition-colors"
              >
                <Phone className="w-4 h-4" />
                <span className="text-sm font-semibold">Crisis Help</span>
              </button>

              <button
                onClick={toggleTheme}
                className="p-2.5 rounded-xl hover:bg-surface-light dark:hover:bg-surface-dark transition-all"
              >
                {theme === 'light' ? (
                  <Moon className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                ) : (
                  <Sun className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                )}
              </button>

              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center space-x-3 p-1.5 rounded-xl hover:bg-surface-light dark:hover:bg-surface-dark transition-colors"
                >
                  <div className="w-9 h-9 bg-gradient-to-br from-primary to-primary-400 rounded-xl flex items-center justify-center text-white font-semibold text-sm shadow-sm">
                    {user.avatar ? (
                      <img src={user.avatar} alt="Profile" className="w-full h-full object-cover rounded-xl" />
                    ) : (
                      (user.name || 'U').charAt(0).toUpperCase()
                    )}
                  </div>
                  <div className="hidden lg:block text-left">
                    <p className="text-sm font-semibold text-gray-800 dark:text-white leading-none">{user.name || 'User'}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 capitalize">{user.role}</p>
                  </div>
                  <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${userMenuOpen ? 'rotate-180' : ''}`} />
                </button>

                {userMenuOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-card-light dark:bg-card-dark rounded-xl shadow-xl border border-gray-100 dark:border-gray-700 py-1.5 z-50 animate-fade-in-up">
                    <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-700 flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-primary to-primary-400 rounded-xl flex items-center justify-center text-white font-semibold shadow-sm">
                        {user.avatar ? (
                          <img src={user.avatar} alt="Profile" className="w-full h-full object-cover rounded-xl" />
                        ) : (
                          (user.name || 'U').charAt(0).toUpperCase()
                        )}
                      </div>
                      <div className="overflow-hidden">
                        <p className="text-sm font-semibold text-gray-800 dark:text-white truncate">{user.name || 'User'}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{user.email}</p>
                      </div>
                    </div>
                    
                    <div className="py-1">
                      <Link
                        to="/profile"
                        onClick={() => setUserMenuOpen(false)}
                        className="flex items-center space-x-3 px-4 py-2.5 text-sm text-gray-600 dark:text-gray-300 hover:bg-surface-light dark:hover:bg-surface-dark rounded-lg transition-colors mx-1"
                      >
                        <User className="w-4 h-4" />
                        <span>My Profile</span>
                      </Link>
                      
                      <Link
                        to="/profile"
                        onClick={() => setUserMenuOpen(false)}
                        className="flex items-center space-x-3 px-4 py-2.5 text-sm text-gray-600 dark:text-gray-300 hover:bg-surface-light dark:hover:bg-surface-dark rounded-lg transition-colors mx-1"
                      >
                        <Settings className="w-4 h-4" />
                        <span>Account Settings</span>
                      </Link>
                    </div>

                    <div className="py-1 border-t border-gray-100 dark:border-gray-700">
                      <button
                        onClick={() => {
                          setUserMenuOpen(false);
                          logout();
                        }}
                        className="w-full flex items-center space-x-3 px-4 py-2.5 text-sm text-danger hover:bg-danger/10 rounded-lg transition-colors mx-1"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="flex md:hidden items-center space-x-1">
              <Link
                to="/notifications"
                className="relative p-2.5 rounded-xl hover:bg-surface-light dark:hover:bg-surface-dark"
              >
                <Bell className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                {unreadCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-danger text-white text-xs font-bold rounded-full flex items-center justify-center">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </Link>
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2.5 rounded-xl hover:bg-surface-light dark:hover:bg-surface-dark"
              >
                {mobileMenuOpen ? (
                  <X className="w-6 h-6 text-gray-600 dark:text-gray-300" />
                ) : (
                  <Menu className="w-6 h-6 text-gray-600 dark:text-gray-300" />
                )}
              </button>
            </div>
          </div>

          {mobileMenuOpen && (
            <div className="md:hidden py-4 border-t border-gray-100 dark:border-gray-700">
              <div className="flex flex-col space-y-1">
                <Link
                  to="/profile"
                  className="flex items-center space-x-3 px-4 py-3 text-gray-600 dark:text-gray-300 rounded-xl"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <User className="w-5 h-5" />
                  <span>My Profile</span>
                </Link>
                <Link
                  to="/notifications"
                  className="flex items-center justify-between px-4 py-3 text-gray-600 dark:text-gray-300 rounded-xl"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <div className="flex items-center space-x-3">
                    <Bell className="w-5 h-5" />
                    <span>Notifications</span>
                  </div>
                  {unreadCount > 0 && (
                    <span className="w-6 h-6 bg-danger text-white text-xs font-bold rounded-full flex items-center justify-center">
                      {unreadCount}
                    </span>
                  )}
                </Link>
                <button
                  onClick={() => {
                    setShowCrisis(true);
                    setMobileMenuOpen(false);
                  }}
                  className="flex items-center space-x-3 px-4 py-3 text-danger rounded-xl"
                >
                  <Phone className="w-5 h-5" />
                  <span className="font-semibold">Crisis Help</span>
                </button>
                <button
                  onClick={() => {
                    toggleTheme();
                    setMobileMenuOpen(false);
                  }}
                  className="flex items-center space-x-3 px-4 py-3 text-gray-600 dark:text-gray-300 rounded-xl"
                >
                  {theme === 'light' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
                  <span>{theme === 'light' ? 'Dark Mode' : 'Light Mode'}</span>
                </button>
                <button
                  onClick={() => {
                    logout();
                    setMobileMenuOpen(false);
                  }}
                  className="flex items-center space-x-3 px-4 py-3 text-danger rounded-xl"
                >
                  <LogOut className="w-5 h-5" />
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </nav>

      {showCrisis && <CrisisAlert onClose={() => setShowCrisis(false)} />}
    </>
  );
}

