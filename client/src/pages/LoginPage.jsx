import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { GraduationCap, Lock, Mail, ArrowRight, Sparkles, UserCheck, AlertCircle } from 'lucide-react';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const from = location.state?.from?.pathname || null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const user = await login(email, password);
      // Redirect based on role or original destination
      if (from) {
        navigate(from, { replace: true });
      } else if (user.role === 'TEACHER') {
        navigate('/', { replace: true });
      } else {
        navigate('/apply', { replace: true });
      }
    } catch (err) {
      setError(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleQuickLogin = (demoEmail, demoPassword) => {
    setEmail(demoEmail);
    setPassword(demoPassword);
    setError(null);
  };

  return (
    <div className="min-h-[75vh] flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Header Branding */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-teal-600 to-emerald-400 shadow-xl shadow-teal-500/20 mb-4">
            <GraduationCap className="w-8 h-8 text-slate-950" />
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Sign in to ScholarSync</h1>
          <p className="text-xs text-slate-400 mt-1">
            Access your personalized faculty dashboard or student research portal
          </p>
        </div>

        {/* Card */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 backdrop-blur-xl shadow-2xl relative overflow-hidden">
          <div className="absolute -top-24 -right-24 w-48 h-48 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />

          {error && (
            <div className="mb-5 p-3.5 rounded-xl bg-red-500/10 border border-red-500/30 flex items-start gap-2.5 text-xs text-red-300">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wider">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@aust.edu"
                  className="w-full bg-slate-950 border border-slate-800 focus:border-teal-500 rounded-xl px-10 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-teal-500 transition"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wider">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-slate-950 border border-slate-800 focus:border-teal-500 rounded-xl px-10 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-teal-500 transition"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full mt-2 py-3 px-4 rounded-xl bg-gradient-to-r from-teal-500 to-emerald-400 hover:from-teal-400 hover:to-emerald-300 text-slate-950 font-bold text-sm tracking-wide shadow-lg shadow-teal-500/20 hover:shadow-teal-500/30 active:scale-[0.98] transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? (
                <span>Authenticating...</span>
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Quick Demo Fill Buttons */}
          <div className="mt-6 pt-5 border-t border-slate-800/80">
            <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2.5 text-center flex items-center justify-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-teal-400" />
              <span>1-Click Hackathon Demo Logins</span>
            </p>
            <div className="grid grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={() => handleQuickLogin('teacher@aust.edu', 'teacher123')}
                className="px-3 py-2 rounded-xl bg-slate-800/70 hover:bg-slate-800 border border-slate-700 hover:border-teal-500/50 text-left transition text-xs group cursor-pointer"
              >
                <div className="font-semibold text-teal-300 flex items-center gap-1">
                  <span>👨‍🏫 Demo Teacher</span>
                </div>
                <div className="text-[10px] text-slate-400 truncate">Prof. Al-Mamun</div>
              </button>

              <button
                type="button"
                onClick={() => handleQuickLogin('student@aust.edu', 'student123')}
                className="px-3 py-2 rounded-xl bg-slate-800/70 hover:bg-slate-800 border border-slate-700 hover:border-emerald-500/50 text-left transition text-xs group cursor-pointer"
              >
                <div className="font-semibold text-emerald-300 flex items-center gap-1">
                  <span>🎓 Demo Student</span>
                </div>
                <div className="text-[10px] text-slate-400 truncate">Rafi Ahmed</div>
              </button>
            </div>
          </div>

          <div className="mt-6 text-center text-xs text-slate-400">
            Don't have an account?{' '}
            <Link to="/register" className="text-teal-400 hover:text-teal-300 font-semibold underline underline-offset-4">
              Register now
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
