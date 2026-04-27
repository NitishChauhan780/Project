import { Link, useLocation } from "react-router-dom";
import { useApp } from "../../context/AppContext";
import {
  LayoutDashboard,
  Smile,
  ClipboardList,
  BookOpen,
  MessageCircle,
  Calendar,
  FileText,
  Users,
  Settings,
  Heart,
  Activity,
  Lightbulb,
  AlertTriangle,
  Eye,
  Shield,
  Megaphone,
  Home,
  X,
  Menu,
  Moon,
  CheckCircle,
  Clock,
  Download,
} from "lucide-react";
import { useState } from "react";

export default function Sidebar() {
  const { user, isStudent, isCounsellor, isAdmin } = useApp();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  if (!user) return null;

  const studentLinks = [
    { path: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
    { path: "/mood", icon: Smile, label: "Mood Tracker" },
    { path: "/checkin", icon: CheckCircle, label: "Daily Check-In" },
    { path: "/quiz", icon: ClipboardList, label: "Quizzes" },
    { path: "/chat", icon: MessageCircle, label: "MindBot" },
    { path: "/journal", icon: BookOpen, label: "Journal" },
    { path: "/sleep", icon: Moon, label: "Sleep Tracker" },
    { path: "/appointments", icon: Calendar, label: "Appointments" },
    { path: "/messages", icon: MessageCircle, label: "Messages" },
    { path: "/resources", icon: FileText, label: "Resources" },
    { path: "/forum", icon: Users, label: "Forum" },
    { path: "/wellness", icon: Heart, label: "Wellness" },
    { path: "/progress", icon: Activity, label: "Progress" },
    { path: "/export", icon: Download, label: "Export Data" },
    { path: "/profile", icon: Settings, label: "Profile" },
  ];

  const studentBottomNav = [
    { path: "/dashboard", icon: Home, label: "Home" },
    { path: "/mood", icon: Smile, label: "Mood" },
    { path: "/chat", icon: MessageCircle, label: "Chat" },
    { path: "/profile", icon: Settings, label: "Profile" },
  ];

  const counsellorLinks = [
    { path: "/counsellor", icon: LayoutDashboard, label: "Dashboard" },
    { path: "/counsellor/alerts", icon: AlertTriangle, label: "At-Risk Alerts" },
    { path: "/counsellor/students", icon: Eye, label: "Student History" },
    { path: "/appointments", icon: Calendar, label: "Appointments" },
    { path: "/counsellor/availability", icon: Clock, label: "Availability" },
    { path: "/messages", icon: MessageCircle, label: "Messages" },
    { path: "/resources", icon: FileText, label: "Resources" },
    { path: "/forum", icon: Users, label: "Forum" },
    { path: "/profile", icon: Settings, label: "Profile" },
  ];

  const adminLinks = [
    { path: "/admin", icon: LayoutDashboard, label: "Dashboard" },
    { path: "/admin/users", icon: Users, label: "User Management" },
    { path: "/admin/resources", icon: FileText, label: "Resources" },
    { path: "/admin/moderation", icon: Shield, label: "Moderation" },
    { path: "/admin/announcements", icon: Megaphone, label: "Announcements" },
    { path: "/settings", icon: Settings, label: "Settings" },
  ];

  const links = isStudent
    ? studentLinks
    : isCounsellor
      ? counsellorLinks
      : adminLinks;
  const bottomNav = isStudent ? studentBottomNav : [];

  return (
    <>
      <aside className="hidden lg:flex flex-col w-64 bg-card-light dark:bg-card-dark border-r border-gray-100 dark:border-gray-800 h-[calc(100vh-4rem)] fixed left-0 top-16 z-40 overflow-y-auto">
        <nav className="flex-1 p-4 space-y-1">
          {links.map((link) => {
            const Icon = link.icon;
            const isActive = location.pathname === link.path;

            return (
              <Link
                key={link.path}
                to={link.path}
                className={`flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                  isActive
                    ? "bg-gradient-to-r from-primary to-primary-400 text-white shadow-md"
                    : "text-gray-600 dark:text-gray-300 hover:bg-surface-light dark:hover:bg-surface-dark"
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="font-medium">{link.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-gray-100 dark:border-gray-800">
          <div className="p-4 bg-gradient-to-br from-primary/10 to-accent/10 rounded-2xl">
            <Lightbulb className="w-5 h-5 text-primary mb-2" />
            <p className="text-xs text-gray-600 dark:text-gray-400">
              Remember: Taking care of your mental health is just as important as your physical health.
            </p>
          </div>
        </div>
      </aside>

      {isStudent && (
        <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-card-light dark:bg-card-dark border-t border-gray-100 dark:border-gray-800 shadow-lg">
          <div className="flex justify-around items-center h-16">
            {studentBottomNav.map((link) => {
              const Icon = link.icon;
              const isActive = location.pathname === link.path;

              return (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`flex flex-col items-center justify-center flex-1 py-2 transition-colors ${
                    isActive
                      ? "text-primary"
                      : "text-gray-400 dark:text-gray-500"
                  }`}
                >
                  <Icon className="w-5 h-5 mb-1" />
                  <span className="text-xs">{link.label}</span>
                </Link>
              );
            })}
          </div>
        </nav>
      )}

      <button
        onClick={() => setMobileOpen(true)}
        className="lg:hidden fixed bottom-20 right-6 z-50 p-3 bg-primary text-white rounded-xl shadow-lg hover:shadow-glow transition-all"
        title="Open Menu"
      >
        <Menu className="w-6 h-6" />
      </button>

      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setMobileOpen(false)}
          />
          <div className="absolute left-0 top-0 bottom-0 w-72 bg-card-light dark:bg-card-dark shadow-2xl">
            <div className="flex items-center justify-between p-4 border-b border-gray-100 dark:border-gray-700">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-primary to-primary-400 rounded-xl flex items-center justify-center">
                  <Home className="w-5 h-5 text-white" />
                </div>
                <span className="text-lg font-bold text-gray-800 dark:text-white">Menu</span>
              </div>
              <button
                onClick={() => setMobileOpen(false)}
                className="p-2 hover:bg-surface-light dark:hover:bg-surface-dark rounded-xl"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            <nav className="p-4 space-y-1 overflow-y-auto max-h-[calc(100vh-120px)]">
              {links.map((link) => {
                const Icon = link.icon;
                const isActive = location.pathname === link.path;

                return (
                  <Link
                    key={link.path}
                    to={link.path}
                    onClick={() => setMobileOpen(false)}
                    className={`flex items-center space-x-3 px-4 py-3 rounded-xl transition-all ${
                      isActive
                        ? "bg-gradient-to-r from-primary to-primary-400 text-white"
                        : "text-gray-600 dark:text-gray-300 hover:bg-surface-light dark:hover:bg-surface-dark"
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="font-medium">{link.label}</span>
                  </Link>
                );
              })}
            </nav>
          </div>
        </div>
      )}
    </>
  );
}

