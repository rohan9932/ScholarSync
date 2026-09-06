import React from 'react';
import { BrowserRouter, Routes, Route, Link, useLocation, Navigate } from 'react-router-dom';
import { AppProvider } from './context/AppContext.jsx';
import { AuthProvider, useAuth } from './context/AuthContext.jsx';
import ProtectedRoute from './components/auth/ProtectedRoute.jsx';
import FacultyDashboardPage from './pages/FacultyDashboardPage.jsx';
import StudentApplyPage from './pages/StudentApplyPage.jsx';
import StudentBookingPage from './pages/StudentBookingPage.jsx';
import LoginPage from './pages/LoginPage.jsx';
import RegisterPage from './pages/RegisterPage.jsx';
import ChatWidget from './components/chatbot/ChatWidget.jsx';
import { GraduationCap, LogOut, User, LogIn, Sparkles, BookOpen, Calendar, LayoutDashboard } from 'lucide-react';

function Navigation() {
  const location = useLocation();
  const { user, isAuthenticated, isTeacher, isStudent, logout } = useAuth();

  return (
    <header className="sticky top-0 z-40 bg-slate-900/80 backdrop-blur-md border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand */}
        <Link to="/" className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-teal-600 to-emerald-400 flex items-center justify-center shadow-lg shadow-teal-500/20">
            <GraduationCap className="w-5 h-5 text-slate-950" />
          </div>
          <div>
            <span className="font-bold text-lg text-white tracking-tight">ScholarSync</span>
            <span className="text-[10px] text-teal-400 font-semibold block leading-none">AUST AI Carnival</span>
          </div>
        </Link>

        {/* Dynamic Navigation Links based on Role */}
        <nav className="flex items-center gap-1 sm:gap-2">
          {isAuthenticated ? (
            <>
              {isTeacher && (
                <Link
                  to="/"
                  className={`px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-medium transition flex items-center gap-1.5 ${
                    location.pathname === '/'
                      ? 'bg-slate-800 text-teal-300 border border-slate-700'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <LayoutDashboard className="w-3.5 h-3.5" />
                  <span>Faculty Portal</span>
                </Link>
              )}

              {isStudent && (
                <>
                  <Link
                    to="/apply"
                    className={`px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-medium transition flex items-center gap-1.5 ${
                      location.pathname === '/apply'
                        ? 'bg-slate-800 text-emerald-300 border border-slate-700'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <BookOpen className="w-3.5 h-3.5" />
                    <span>Apply for Mentorship</span>
                  </Link>
                  <Link
                    to="/book"
                    className={`px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-medium transition flex items-center gap-1.5 ${
                      location.pathname === '/book'
                        ? 'bg-slate-800 text-emerald-300 border border-slate-700'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <Calendar className="w-3.5 h-3.5" />
                    <span>Book Consultation</span>
                  </Link>
                </>
              )}

              {/* User Profile & Role Chip */}
              <div className="flex items-center gap-2 pl-2 border-l border-slate-800 ml-1">
                <div className="text-right hidden sm:block">
                  <div className="text-xs font-semibold text-white leading-tight truncate max-w-[140px]">
                    {user.name}
                  </div>
                  <span
                    className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md inline-block uppercase tracking-wider ${
                      isTeacher
                        ? 'bg-teal-500/20 text-teal-300 border border-teal-500/30'
                        : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                    }`}
                  >
                    {isTeacher ? 'Faculty' : 'Student'}
                  </span>
                </div>

                {/* Logout Button */}
                <button
                  onClick={logout}
                  title="Log out"
                  className="p-2 rounded-xl bg-slate-800/60 hover:bg-red-500/20 text-slate-400 hover:text-red-300 border border-slate-700 hover:border-red-500/30 transition cursor-pointer"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            </>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                to="/login"
                className="px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-semibold bg-gradient-to-r from-teal-500 to-emerald-400 text-slate-950 shadow-md shadow-teal-500/20 hover:opacity-90 transition flex items-center gap-1.5"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Sign In</span>
              </Link>
              <Link
                to="/register"
                className="px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-medium text-slate-400 hover:text-white border border-slate-800 hover:border-slate-700 transition hidden sm:inline-block"
              >
                Register
              </Link>
            </div>
          )}
        </nav>
      </div>
    </header>
  );
}

function MainContent() {
  const { isTeacher, isAuthenticated } = useAuth();

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100 selection:bg-teal-500 selection:text-slate-950">
      <Navigation />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Routes>
          {/* Public Auth Routes */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* Role Protected Routes */}
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

          {/* Catch-all fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>

      <footer className="border-t border-slate-800 py-6 text-center text-xs text-slate-500">
        <p>ScholarSync &copy; 2026 &bull; AUST CSE Carnival &lt;8.0/&gt; AI Hackathon</p>
      </footer>

      {/* Persistent AI Chatbot Widget — Available exclusively to Teachers */}
      {isAuthenticated && isTeacher && <ChatWidget />}
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppProvider>
        <BrowserRouter>
          <MainContent />
        </BrowserRouter>
      </AppProvider>
    </AuthProvider>
  );
}
