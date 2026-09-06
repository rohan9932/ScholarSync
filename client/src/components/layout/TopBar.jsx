import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import { Calendar, ChevronRight, UserCheck, Sparkles, LogIn, Menu } from 'lucide-react';

export default function TopBar({ onOpenMobileSidebar }) {
  const location = useLocation();
  const { user, isTeacher, isStudent, isAuthenticated } = useAuth();

  const getBreadcrumb = () => {
    switch (location.pathname) {
      case '/':
        return { root: 'Faculty Portal', page: 'Overview & Timetable' };
      case '/apply':
        return { root: 'Student App', page: 'Apply for Mentorship' };
      case '/book':
        return { root: 'Student App', page: 'Book Consultation' };
      case '/login':
        return { root: 'Authentication', page: 'Sign In' };
      case '/register':
        return { root: 'Authentication', page: 'Create Account' };
      default:
        return { root: 'ScholarSync', page: 'Dashboard' };
    }
  };

  const breadcrumb = getBreadcrumb();

  return (
    <header className="h-16 bg-base/80 backdrop-blur-md border-b border-white/[0.06] sticky top-0 z-20 px-4 sm:px-8 flex items-center justify-between">
      {/* Left Breadcrumb & Mobile Hamburger */}
      <div className="flex items-center gap-2.5 text-xs">
        <button
          onClick={onOpenMobileSidebar}
          className="md:hidden p-1.5 rounded-lg text-secondary hover:text-white hover:bg-surface border border-white/[0.06]"
          aria-label="Open sidebar navigation"
        >
          <Menu className="w-4 h-4" />
        </button>
        <span className="text-secondary font-medium hidden sm:inline">{breadcrumb.root}</span>
        <ChevronRight className="w-3.5 h-3.5 text-muted hidden sm:inline" />
        <span className="text-white font-semibold">{breadcrumb.page}</span>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-3">
        {/* Date chip */}
        <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full bg-surface border border-white/[0.06] text-xs text-secondary font-medium">
          <Calendar className="w-3.5 h-3.5 text-accent-400" />
          <span>Sunday, 6 Sept 2026</span>
        </div>

        {isAuthenticated ? (
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-semibold px-2.5 py-1 rounded-full bg-surface-raised border border-white/[0.06] text-accent-400">
              {isTeacher ? '👨‍🏫 Faculty Account' : '🎓 Student Account'}
            </span>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <Link
              to="/login"
              className="px-3.5 py-1.5 rounded-lg bg-accent-600 hover:bg-accent-500 text-white font-semibold text-xs transition flex items-center gap-1.5"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Sign In</span>
            </Link>
          </div>
        )}
      </div>
    </header>
  );
}
