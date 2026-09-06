import React from 'react';
import { BrowserRouter, Routes, Route, Link, useLocation } from 'react-router-dom';
import { AppProvider } from './context/AppContext.jsx';
import FacultyDashboardPage from './pages/FacultyDashboardPage.jsx';
import StudentApplyPage from './pages/StudentApplyPage.jsx';
import StudentBookingPage from './pages/StudentBookingPage.jsx';
import ChatWidget from './components/chatbot/ChatWidget.jsx';
import { Sparkles, Calendar, BookOpen, GraduationCap } from 'lucide-react';

function Navigation() {
  const location = useLocation();

  return (
    <header className="sticky top-0 z-40 bg-slate-900/80 backdrop-blur-md border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-teal-600 to-emerald-400 flex items-center justify-center shadow-lg shadow-teal-500/20">
            <GraduationCap className="w-5 h-5 text-slate-950" />
          </div>
          <div>
            <span className="font-bold text-lg text-white tracking-tight">ScholarSync</span>
            <span className="text-[10px] text-teal-400 font-semibold block leading-none">AUST AI Carnival</span>
          </div>
        </Link>

        <nav className="flex items-center gap-1 sm:gap-2">
          <Link
            to="/"
            className={`px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-medium transition ${
              location.pathname === '/'
                ? 'bg-slate-800 text-teal-300 border border-slate-700'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Faculty Portal
          </Link>
          <Link
            to="/apply"
            className={`px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-medium transition ${
              location.pathname === '/apply'
                ? 'bg-slate-800 text-teal-300 border border-slate-700'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Apply for Mentorship
          </Link>
          <Link
            to="/book"
            className={`px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-medium transition ${
              location.pathname === '/book'
                ? 'bg-slate-800 text-teal-300 border border-slate-700'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Book Consultation
          </Link>
        </nav>
      </div>
    </header>
  );
}

export default function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100 selection:bg-teal-500 selection:text-slate-950">
          <Navigation />

          <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <Routes>
              <Route path="/" element={<FacultyDashboardPage />} />
              <Route path="/apply" element={<StudentApplyPage />} />
              <Route path="/book" element={<StudentBookingPage />} />
            </Routes>
          </main>

          <footer className="border-t border-slate-800 py-6 text-center text-xs text-slate-500">
            <p>ScholarSync &copy; 2026 &bull; AUST CSE Carnival &lt;8.0/&gt; AI Hackathon</p>
          </footer>

          {/* Persistent AI Chatbot Widget */}
          <ChatWidget />
        </div>
      </BrowserRouter>
    </AppProvider>
  );
}
