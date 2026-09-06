import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import {
  GraduationCap,
  LayoutDashboard,
  BookOpen,
  Calendar,
  LogOut,
  Sparkles,
  Users,
  Compass,
  CheckCircle2,
  X
} from 'lucide-react';

export default function Sidebar({ mobileOpen = false, onCloseMobile = () => {} }) {
  const location = useLocation();
  const { user, isTeacher, isStudent, logout } = useAuth();

  const getInitial = (name) => {
    return name ? name.trim().charAt(0).toUpperCase() : 'U';
  };

  return (
    <>
      {/* Mobile backdrop */}
      {mobileOpen && (
        <div
          onClick={onCloseMobile}
          className="fixed inset-0 bg-black/70 backdrop-blur-sm z-40 md:hidden animate-fade-in"
        />
      )}

      <aside
        className={`bg-base border-r border-white/[0.06] flex flex-col justify-between shrink-0 min-h-screen z-50 transition-transform duration-200 ease-in-out
          fixed md:sticky top-0 h-screen w-64
          ${mobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
        `}
      >
      {/* Top Section */}
      <div>
        {/* Logo Tile Block */}
        <div className="p-6 border-b border-white/[0.06] flex items-center justify-between">
          <Link to="/" onClick={onCloseMobile} className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-accent-600 flex items-center justify-center shadow-lg shadow-accent-600/20 text-white shrink-0">
              <GraduationCap className="w-5 h-5" />
            </div>
            <div>
              <div className="font-extrabold text-lg text-white tracking-tight leading-tight">
                ScholarSync
              </div>
              <span className="text-[11px] text-accent-400 font-semibold uppercase tracking-wider block">
                {isTeacher ? 'Faculty Portal' : isStudent ? 'Student App' : 'Academic Hub'}
              </span>
            </div>
          </Link>

          {/* Close mobile button */}
          <button
            onClick={onCloseMobile}
            className="md:hidden p-1.5 rounded-lg text-secondary hover:text-white hover:bg-surface"
            aria-label="Close menu"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation List */}
        <nav className="p-4 space-y-1.5">
          <div className="px-3 py-2 text-[11px] font-bold text-accent-400 uppercase tracking-widest">
            Menu
          </div>

          {isTeacher && (
            <Link
              to="/"
              className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition ${
                location.pathname === '/'
                  ? 'bg-surface-raised text-accent-400 font-semibold shadow-sm border border-accent-500/20'
                  : 'text-secondary hover:text-white hover:bg-surface'
              }`}
            >
              <LayoutDashboard className="w-4 h-4 text-accent-400" />
              <span>Dashboard & Schedule</span>
            </Link>
          )}

          {isStudent && (
            <>
              <Link
                to="/apply"
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition ${
                  location.pathname === '/apply'
                    ? 'bg-surface-raised text-accent-400 font-semibold shadow-sm border border-accent-500/20'
                    : 'text-secondary hover:text-white hover:bg-surface'
                }`}
              >
                <BookOpen className="w-4 h-4 text-accent-400" />
                <span>Apply for Mentorship</span>
              </Link>
              <Link
                to="/book"
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition ${
                  location.pathname === '/book'
                    ? 'bg-surface-raised text-accent-400 font-semibold shadow-sm border border-accent-500/20'
                    : 'text-secondary hover:text-white hover:bg-surface'
                }`}
              >
                <Calendar className="w-4 h-4 text-accent-400" />
                <span>Book Consultation</span>
              </Link>
            </>
          )}

          <div className="pt-4 px-3 py-2 text-[11px] font-bold text-muted uppercase tracking-widest">
            AUST CSE Carnival
          </div>
          <div className="px-3.5 py-2 rounded-xl bg-surface border border-white/[0.04] text-xs text-secondary space-y-1">
            <div className="flex items-center gap-1.5 text-accent-400 font-semibold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>AI Build Hackathon</span>
            </div>
            <p className="text-[11px] text-muted">AUST CSE Carnival &lt;8.0/&gt; Final Round onsite demo.</p>
          </div>
        </nav>
      </div>

      {/* Bottom Pinned User Profile Card */}
      {user && (
        <div className="p-4 border-t border-white/[0.06]">
          <div className="bg-surface border border-white/[0.06] rounded-card p-3.5 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-full bg-accent-600/30 border border-accent-500/40 flex items-center justify-center font-bold text-accent-400 text-sm">
                  {getInitial(user.name)}
                </div>
                <div className="overflow-hidden">
                  <div className="text-sm font-semibold text-white truncate max-w-[110px]" title={user.name}>
                    {user.name}
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-accent-400 animate-pulse"></span>
                    <span className="text-[10px] text-accent-400 font-medium lowercase">active</span>
                  </div>
                </div>
              </div>

              <button
                onClick={logout}
                title="Log out"
                className="p-1.5 rounded-lg text-secondary hover:text-red-400 hover:bg-surface-raised transition cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-white/[0.04]">
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-accent-500/10 text-accent-400 border border-accent-500/20">
                {user.role === 'TEACHER' ? 'Faculty' : 'Student'}
              </span>
              <span className="text-[11px] text-muted truncate max-w-[110px]" title={user.email}>
                {user.email}
              </span>
            </div>
          </div>
        </div>
      )}
    </aside>
  </>
  );
}
