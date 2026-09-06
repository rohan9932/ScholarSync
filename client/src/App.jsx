import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AppProvider } from './context/AppContext.jsx';
import { AuthProvider, useAuth } from './context/AuthContext.jsx';
import ProtectedRoute from './components/auth/ProtectedRoute.jsx';
import Sidebar from './components/layout/Sidebar.jsx';
import TopBar from './components/layout/TopBar.jsx';
import FacultyDashboardPage from './pages/FacultyDashboardPage.jsx';
import StudentApplyPage from './pages/StudentApplyPage.jsx';
import StudentBookingPage from './pages/StudentBookingPage.jsx';
import LoginPage from './pages/LoginPage.jsx';
import RegisterPage from './pages/RegisterPage.jsx';
import ChatWidget from './components/chatbot/ChatWidget.jsx';

function AppLayout() {
  const location = useLocation();
  const { user, isTeacher, isStudent, isAuthenticated } = useAuth();
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  const isAuthPage = location.pathname === '/login' || location.pathname === '/register';

  if (isAuthPage) {
    return (
      <div className="min-h-screen bg-base text-primary font-sans selection:bg-accent-500 selection:text-base">
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-base text-primary font-sans flex selection:bg-accent-500 selection:text-base antialiased">
      {/* Fixed Left Sidebar (260px) */}
      <Sidebar
        mobileOpen={mobileSidebarOpen}
        onCloseMobile={() => setMobileSidebarOpen(false)}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen">
        {/* Sticky Top Bar (64px) */}
        <TopBar onOpenMobileSidebar={() => setMobileSidebarOpen(true)} />

        {/* Scrollable Main Area */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          <Routes>
            <Route
              path="/"
              element={
                <ProtectedRoute allowedRoles={['TEACHER']}>
                  <FacultyDashboardPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/apply"
              element={
                <ProtectedRoute allowedRoles={['STUDENT']}>
                  <StudentApplyPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/book"
              element={
                <ProtectedRoute allowedRoles={['STUDENT']}>
                  <StudentBookingPage />
                </ProtectedRoute>
              }
            />
            {/* Catch-all */}
            <Route path="*" element={<Navigate to={isStudent ? "/apply" : "/"} replace />} />
          </Routes>
        </main>

        {/* Global Footer */}
        <footer className="border-t border-white/[0.06] py-5 px-6 text-center text-xs text-muted">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-2 max-w-7xl mx-auto">
            <span>ScholarSync &bull; AI-Powered Faculty Scheduling & Research Mentorship</span>
            <span className="text-secondary">AUST CSE Carnival &lt;8.0/&gt; AI Hackathon 2026</span>
          </div>
        </footer>
      </div>

      {/* Persistent AI Chatbot Widget (Teacher only) */}
      {isAuthenticated && isTeacher && <ChatWidget />}
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppProvider>
        <BrowserRouter>
          <AppLayout />
        </BrowserRouter>
      </AppProvider>
    </AuthProvider>
  );
}
