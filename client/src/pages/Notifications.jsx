import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/common/Navbar";
import Sidebar from "../components/common/Sidebar";
import Card from "../components/common/Card";
import { useApp } from "../context/AppContext";
import { notificationAPI } from "../services/api";
import {
  Bell,
  Check,
  Trash2,
  Calendar,
  AlertCircle,
  MessageCircle,
  Megaphone,
  MessageSquare,
} from "lucide-react";

export default function Notifications() {
  const { user } = useApp();
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?._id) {
      fetchNotifications();
    }
  }, [user]);

  useEffect(() => {
    if (!user?._id) return;
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, [user]);

  const fetchNotifications = async () => {
    if (!user?._id) return;
    try {
      const { data } = await notificationAPI.getAll(user._id);
      setNotifications(data);
    } catch (error) {
      console.error("Error fetching notifications:", error);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (id) => {
    try {
      await notificationAPI.markAsRead(id);
      setNotifications(
        notifications.map((n) => (n._id === id ? { ...n, isRead: true } : n)),
      );
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };

  const markAllAsRead = async () => {
    try {
      await notificationAPI.markAllAsRead(user._id);
      setNotifications(notifications.map((n) => ({ ...n, isRead: true })));
    } catch (error) {
      console.error("Error marking all as read:", error);
    }
  };

  const deleteNotification = async (id) => {
    try {
      await notificationAPI.delete(id);
      setNotifications(notifications.filter((n) => n._id !== id));
    } catch (error) {
      console.error("Error deleting notification:", error);
    }
  };

  const getIcon = (type) => {
    switch (type) {
      case "reminder":
        return <Bell className="w-5 h-5 text-yellow-500" />;
      case "appointment":
        return <Calendar className="w-5 h-5 text-blue-500" />;
      case "achievement":
        return <AlertCircle className="w-5 h-5 text-green-500" />;
      case "forum":
        return <MessageCircle className="w-5 h-5 text-purple-500" />;
      case "system":
        return <AlertCircle className="w-5 h-5 text-gray-500" />;
      case "message":
        return <MessageSquare className="w-5 h-5 text-teal-500" />;
      case "announcement":
        return <Megaphone className="w-5 h-5 text-red-500" />;
      default:
        return <Bell className="w-5 h-5 text-gray-500" />;
    }
  };

  const getLink = (notification) => {
    if (notification.metadata?.link) return notification.metadata.link;
    switch (notification.type) {
      case "appointment":
        return "/appointments";
      case "forum":
        return "/forum";
      case "message":
        return "/messages";
      default:
        return "/dashboard";
    }
  };

  const handleNotificationClick = async (notification) => {
    if (!notification.isRead) {
      await markAsRead(notification._id);
    }
    const link = getLink(notification);
    navigate(link);
  };

  const formatTime = (date) => {
    const diff = Date.now() - new Date(date).getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(hours / 24);

    if (hours < 1) return "Just now";
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return new Date(date).toLocaleDateString();
  };

  const unreadCount = notifications.filter((n) => !n.isRead).length;

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
                <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-2">
                  Notifications
                </h1>
                <p className="text-gray-500 dark:text-gray-400">
                  {unreadCount > 0
                    ? `${unreadCount} unread notification${unreadCount > 1 ? "s" : ""}`
                    : "All caught up!"}
                </p>
              </div>
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="px-4 py-2 text-sm text-primary dark:text-primary hover:bg-primary/10 rounded-lg transition-colors"
                >
                  Mark all as read
                </button>
              )}
            </div>

            {notifications.length > 0 ? (
              <div className="space-y-3">
                {notifications.map((notification) => (
                  <Card
                    key={notification._id}
                    className={`transition-all cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/50 ${
                      notification.isRead
                        ? "opacity-70"
                        : "border-l-4 border-l-primary dark:border-l-primary bg-primary/5 dark:bg-primary/5"
                    }`}
                    onClick={() => handleNotificationClick(notification)}
                  >
                    <div className="flex items-start space-x-4">
                      <div className="w-10 h-10 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center flex-shrink-0">
                        {getIcon(notification.type)}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <h3
                            className={`font-semibold ${notification.isRead ? "text-gray-500" : "text-gray-800 dark:text-white"}`}
                          >
                            {notification.title}
                          </h3>
                          <span className="text-xs text-gray-400">
                            {formatTime(notification.createdAt)}
                          </span>
                        </div>
                        <p
                          className={`text-sm ${notification.isRead ? "text-gray-400" : "text-gray-600 dark:text-gray-300"}`}
                        >
                          {notification.message}
                        </p>
                      </div>
                      <div
                        className="flex items-center space-x-2"
                        onClick={(e) => e.stopPropagation()}
                      >
                        {!notification.isRead && (
                          <button
                            onClick={() => markAsRead(notification._id)}
                            className="p-2 hover:bg-green-100 dark:hover:bg-green-900 rounded-lg text-green-500"
                            title="Mark as read"
                          >
                            <Check className="w-4 h-4" />
                          </button>
                        )}
                        <button
                          onClick={() => deleteNotification(notification._id)}
                          className="p-2 hover:bg-red-100 dark:hover:bg-red-900 rounded-lg text-red-500"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            ) : (
              <Card className="text-center py-12">
                <Bell className="w-16 h-16 mx-auto mb-4 text-gray-300 dark:text-gray-600" />
                <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-2">
                  No Notifications
                </h3>
                <p className="text-gray-500 dark:text-gray-400">
                  You're all caught up! Check back later for reminders and
                  updates.
                </p>
              </Card>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}



