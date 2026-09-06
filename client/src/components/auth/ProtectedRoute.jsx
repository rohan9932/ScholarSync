import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import { Loader2, ShieldAlert } from 'lucide-react';

export default function ProtectedRoute({ children, allowedRoles }) {
  const { user, isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center gap-3">
        <Loader2 className="w-8 h-8 text-teal-400 animate-spin" />
        <p className="text-xs text-slate-400 font-medium tracking-wide">Authenticating session...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // If a Student tries to access Teacher portal, send them to student apply
    if (user.role === 'STUDENT') {
      return <Navigate to="/apply" replace />;
    }
    // If a Teacher tries to access student routes, send them to teacher portal
    if (user.role === 'TEACHER') {
      return <Navigate to="/" replace />;
    }

    return (
      <div className="max-w-md mx-auto my-12 p-6 bg-slate-900 border border-red-500/30 rounded-2xl text-center">
        <ShieldAlert className="w-12 h-12 text-red-400 mx-auto mb-3" />
        <h2 className="text-lg font-bold text-white mb-1">Access Restricted</h2>
        <p className="text-xs text-slate-400">
          Your account role ({user.role}) does not have permission to access this section.
        </p>
      </div>
    );
  }

  return children;
}
