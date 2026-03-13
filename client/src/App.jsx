import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { SocketProvider } from './context/SocketContext';

import Home from './pages/Home';
import CityMap from './pages/CityMap';
import About from './pages/About';
import Login from './pages/Login';
import Register from './pages/Register';
import VerifyEmail from './pages/VerifyEmail';

import Dashboard from './pages/user/Dashboard';
import ReportIssue from './pages/user/ReportIssue';
import MyIssues from './pages/user/MyIssues';
import IssueDetail from './pages/user/IssueDetail';
import VerifyIssues from './pages/user/VerifyIssues';
import Profile from './pages/user/Profile';

import AdminDashboard from './pages/admin/AdminDashboard';
import IssueIntelligence from './pages/admin/IssueIntelligence';
import ManageIssues from './pages/admin/ManageIssues';
import InProgressIssues from './pages/admin/InProgressIssues';
import ResolvedIssues from './pages/admin/ResolvedIssues';
import Analytics from './pages/admin/Analytics';
import FeedbackMetrics from './pages/admin/FeedbackMetrics';
import ChallengeQueue from './pages/admin/ChallengeQueue';
import ChallengeHistory from './pages/admin/ChallengeHistory';
import AdminIssueDetail from './pages/admin/AdminIssueDetail';

const ProtectedRoute = ({ children, adminOnly = false }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" />;
  }

  // Admins and super_admins are always considered verified
  const isVerified = user.isEmailVerified || user.role === 'admin' || user.role === 'super_admin';

  // Redirect unverified regular users to email verification page
  if (!isVerified) {
    return <Navigate to="/verify-email" />;
  }

  if (adminOnly && user.role !== 'admin' && user.role !== 'super_admin') {
    return <Navigate to="/dashboard" />;
  }

  return children;
};

const PublicRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  // Admins and super_admins are always considered verified
  const isVerified = user?.isEmailVerified || user?.role === 'admin' || user?.role === 'super_admin';

  // If user is logged in but email not verified, allow access to public routes
  if (user && !isVerified) {
    return children;
  }

  // If user is logged in and verified, redirect to appropriate dashboard
  if (user && isVerified) {
    if (user.role === 'admin' || user.role === 'super_admin') {
      return <Navigate to="/admin" />;
    }
    return <Navigate to="/dashboard" />;
  }

  return children;
};

function App() {
  return (
    <AuthProvider>
      <SocketProvider>
        <Router>
        <Routes>
          {/* Public Routes - Redirect to dashboard if logged in */}
          <Route path="/" element={<PublicRoute><Home /></PublicRoute>} />
          <Route path="/map" element={<CityMap />} />
          <Route path="/about" element={<About />} />
          <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
          <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />
          <Route path="/verify-email" element={<VerifyEmail />} />

          {/* User Protected Routes */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/report-issue"
            element={
              <ProtectedRoute>
                <ReportIssue />
              </ProtectedRoute>
            }
          />
          <Route
            path="/my-issues"
            element={
              <ProtectedRoute>
                <MyIssues />
              </ProtectedRoute>
            }
          />
          <Route
            path="/issue/:id"
            element={
              <ProtectedRoute>
                <IssueDetail />
              </ProtectedRoute>
            }
          />
          <Route
            path="/verify"
            element={
              <ProtectedRoute>
                <VerifyIssues />
              </ProtectedRoute>
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

          {/* Admin Protected Routes */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute adminOnly={true}>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/issues"
            element={
              <ProtectedRoute adminOnly={true}>
                <IssueIntelligence />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/manage"
            element={
              <ProtectedRoute adminOnly={true}>
                <ManageIssues />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/in-progress"
            element={
              <ProtectedRoute adminOnly={true}>
                <InProgressIssues />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/resolved"
            element={
              <ProtectedRoute adminOnly={true}>
                <ResolvedIssues />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/analytics"
            element={
              <ProtectedRoute adminOnly={true}>
                <Analytics />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/feedback"
            element={
              <ProtectedRoute adminOnly={true}>
                <FeedbackMetrics />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/challenge-queue"
            element={
              <ProtectedRoute adminOnly={true}>
                <ChallengeQueue />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/challenge-history"
            element={
              <ProtectedRoute adminOnly={true}>
                <ChallengeHistory />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/issue/:id"
            element={
              <ProtectedRoute adminOnly={true}>
                <AdminIssueDetail />
              </ProtectedRoute>
            }
          />

          {/* Catch all */}
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </Router>
      </SocketProvider>
    </AuthProvider>
  );
}

export default App;
