import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AppProvider, useApp } from "./context/AppContext";
import { ToastProvider } from "./context/ToastContext";

import Login from "./pages/Login";
import Signup from "./pages/Signup";
import StudentDashboard from "./pages/StudentDashboard";
import MoodTracker from "./pages/MoodTracker";
import QuizList from "./pages/QuizList";
import QuizPage from "./pages/QuizPage";
import JournalPage from "./pages/JournalPage";
import MindBotPage from "./pages/MindBotPage";
import AppointmentsPage from "./pages/AppointmentsPage";
import ResourcesPage from "./pages/ResourcesPage";
import ForumPage from "./pages/ForumPage";
import WellnessPage from "./pages/WellnessPage";
import CounsellorDashboard from "./pages/CounsellorDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import UserManagement from "./pages/admin/UserManagement";
import AdminResources from "./pages/admin/AdminResources";
import ForumModeration from "./pages/admin/ForumModeration";
import AtRiskAlerts from "./pages/counsellor/AtRiskAlerts";
import CounsellorOverview from "./pages/admin/CounsellorOverview";
import Announcements from "./pages/admin/Announcements";
import Settings from "./pages/admin/Settings";
import Profile from "./pages/Profile";
import Progress from "./pages/Progress";
import Notifications from "./pages/Notifications";
import SleepTracker from "./pages/SleepTracker";
import Messages from "./pages/Messages";
import DailyCheckIn from "./pages/DailyCheckIn";
import StudentHistory from "./pages/counsellor/StudentHistory";
import CounsellorAvailability from "./pages/counsellor/Availability";
import ExportData from "./pages/ExportData";
import LandingPage from "./pages/LandingPage";
import SOSButton from "./components/common/SOSButton";
import Footer from "./components/common/Footer";

function ProtectedRoute({ children }) {
  const { user, loading } = useApp();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background-light dark:bg-background-dark">
        <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/" replace />;
  }

  return children;
}

function RoleBasedRoute({ children, allowedRoles }) {
  const { user, loading } = useApp();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background-light dark:bg-background-dark">
        <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  const userRole = user.role?.toLowerCase();
  if (!userRole) {
    return <Navigate to="/login" replace />;
  }

  if (!allowedRoles.map((r) => r.toLowerCase()).includes(userRole)) {
    const fallbackPath =
      userRole === "admin"
        ? "/admin"
        : userRole === "counsellor"
          ? "/counsellor"
          : "/dashboard";
    return <Navigate to={fallbackPath} replace />;
  }

  return children;
}

function AppRoutes() {
  const { user } = useApp();

  const getDashboardPath = () => {
    if (!user) return "/";
    const role = user.role?.toLowerCase();
    if (!role) return "/login";
    if (role === "admin") return "/admin";
    if (role === "counsellor") return "/counsellor";
    return "/dashboard";
  };

  return (
    <Routes>
      <Route
        path="/"
        element={
          user ? <Navigate to={getDashboardPath()} replace /> : <LandingPage />
        }
      />
      <Route
        path="/login"
        element={
          user ? <Navigate to={getDashboardPath()} replace /> : <Login />
        }
      />
      <Route
        path="/signup"
        element={
          user ? <Navigate to={getDashboardPath()} replace /> : <Signup />
        }
      />

      <Route
        path="/dashboard"
        element={
          <RoleBasedRoute allowedRoles={["student"]}>
            <StudentDashboard />
          </RoleBasedRoute>
        }
      />

      <Route
        path="/mood"
        element={
          <RoleBasedRoute allowedRoles={["student"]}>
            <MoodTracker />
          </RoleBasedRoute>
        }
      />

      <Route
        path="/quiz"
        element={
          <RoleBasedRoute allowedRoles={["student"]}>
            <QuizList />
          </RoleBasedRoute>
        }
      />

      <Route
        path="/quiz/:type"
        element={
          <RoleBasedRoute allowedRoles={["student"]}>
            <QuizPage />
          </RoleBasedRoute>
        }
      />

      <Route
        path="/journal"
        element={
          <RoleBasedRoute allowedRoles={["student"]}>
            <JournalPage />
          </RoleBasedRoute>
        }
      />

      <Route
        path="/chat"
        element={
          <RoleBasedRoute allowedRoles={["student"]}>
            <MindBotPage />
          </RoleBasedRoute>
        }
      />

      <Route
        path="/appointments"
        element={
          <RoleBasedRoute allowedRoles={["student", "counsellor"]}>
            <AppointmentsPage />
          </RoleBasedRoute>
        }
      />

      <Route
        path="/resources"
        element={
          <ProtectedRoute>
            <ResourcesPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/forum"
        element={
          <ProtectedRoute>
            <ForumPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/wellness"
        element={
          <RoleBasedRoute allowedRoles={["student"]}>
            <WellnessPage />
          </RoleBasedRoute>
        }
      />

      <Route
        path="/counsellor"
        element={
          <RoleBasedRoute allowedRoles={["counsellor"]}>
            <CounsellorDashboard />
          </RoleBasedRoute>
        }
      />

      <Route
        path="/counsellor/students"
        element={
          <RoleBasedRoute allowedRoles={["counsellor"]}>
            <StudentHistory />
          </RoleBasedRoute>
        }
      />

      <Route
        path="/counsellor/availability"
        element={
          <RoleBasedRoute allowedRoles={["counsellor"]}>
            <CounsellorAvailability />
          </RoleBasedRoute>
        }
      />

      <Route
        path="/export"
        element={
          <RoleBasedRoute allowedRoles={["student", "counsellor"]}>
            <ExportData />
          </RoleBasedRoute>
        }
      />

      <Route
        path="/admin/users"
        element={
          <RoleBasedRoute allowedRoles={["admin"]}>
            <UserManagement />
          </RoleBasedRoute>
        }
      />

      <Route
        path="/admin/resources"
        element={
          <RoleBasedRoute allowedRoles={["admin"]}>
            <AdminResources />
          </RoleBasedRoute>
        }
      />

      <Route
        path="/admin/moderation"
        element={
          <RoleBasedRoute allowedRoles={["admin"]}>
            <ForumModeration />
          </RoleBasedRoute>
        }
      />

      <Route
        path="/counsellor/alerts"
        element={
          <RoleBasedRoute allowedRoles={["counsellor"]}>
            <AtRiskAlerts />
          </RoleBasedRoute>
        }
      />

      <Route
        path="/admin/counsellors"
        element={
          <RoleBasedRoute allowedRoles={["admin"]}>
            <CounsellorOverview />
          </RoleBasedRoute>
        }
      />

      <Route
        path="/admin/announcements"
        element={
          <RoleBasedRoute allowedRoles={["admin"]}>
            <Announcements />
          </RoleBasedRoute>
        }
      />

      <Route
        path="/admin"
        element={
          <RoleBasedRoute allowedRoles={["admin"]}>
            <AdminDashboard />
          </RoleBasedRoute>
        }
      />

      <Route
        path="/settings"
        element={
          <RoleBasedRoute allowedRoles={["admin"]}>
            <Settings />
          </RoleBasedRoute>
        }
      />

      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <Profile />
          </ProtectedRoute>
        }
      />

      <Route
        path="/progress"
        element={
          <RoleBasedRoute allowedRoles={["student"]}>
            <Progress />
          </RoleBasedRoute>
        }
      />

      <Route
        path="/notifications"
        element={
          <ProtectedRoute>
            <Notifications />
          </ProtectedRoute>
        }
      />

      <Route
        path="/sleep"
        element={
          <RoleBasedRoute allowedRoles={["student", "counsellor"]}>
            <SleepTracker />
          </RoleBasedRoute>
        }
      />

      <Route
        path="/messages"
        element={
          <ProtectedRoute>
            <Messages />
          </ProtectedRoute>
        }
      />

      <Route
        path="/messages/:appointmentId"
        element={
          <ProtectedRoute>
            <Messages />
          </ProtectedRoute>
        }
      />

      <Route
        path="/checkin"
        element={
          <RoleBasedRoute allowedRoles={["student"]}>
            <DailyCheckIn />
          </RoleBasedRoute>
        }
      />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

function AppContent() {
  const { user } = useApp();

  return (
    <div className="flex flex-col min-h-screen">
      <div className="flex-grow">
        <AppRoutes />
      </div>
      {user && <Footer />}
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppProvider>
        <ToastProvider>
          <AppContent />
          <SOSButton />
        </ToastProvider>
      </AppProvider>
    </BrowserRouter>
  );
}



