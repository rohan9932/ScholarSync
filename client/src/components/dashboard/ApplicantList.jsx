import React from 'react';
import MatchScoreCard from './MatchScoreCard.jsx';
import { Check, X, Mail, Phone } from 'lucide-react';

export default function ApplicantList({ applications = [], onDecide }) {
  if (!applications || applications.length === 0) {
    return (
      <div className="p-8 text-center bg-slate-800/30 rounded-2xl border border-slate-700/50">
        <p className="text-slate-400 text-sm">No student applications received yet.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {applications.map((app) => (
        <div
          key={app.id}
          className="bg-slate-800/50 border border-slate-700/70 rounded-2xl p-5 hover:border-slate-600 transition space-y-4"
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h3 className="font-semibold text-white text-base">{app.studentName}</h3>
              <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400 mt-1">
                <span className="flex items-center gap-1">
                  <Mail className="w-3.5 h-3.5" />
                  {app.studentEmail}
                </span>
                {app.studentContact && (
                  <span className="flex items-center gap-1">
                    <Phone className="w-3.5 h-3.5" />
                    {app.studentContact}
                  </span>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2 self-end sm:self-auto">
              <span className="text-xs px-2.5 py-1 rounded-full bg-slate-700 text-slate-300">
                {app.status}
              </span>
              {app.status === 'PENDING' && (
                <>
                  <button
                    onClick={() => onDecide?.(app.id, 'ACCEPTED')}
                    className="flex items-center gap-1 bg-emerald-600 hover:bg-emerald-500 text-white text-xs px-3 py-1.5 rounded-lg transition"
                  >
                    <Check className="w-3.5 h-3.5" />
                    Accept
                  </button>
                  <button
                    onClick={() => onDecide?.(app.id, 'REJECTED')}
                    className="flex items-center gap-1 bg-rose-600/80 hover:bg-rose-600 text-white text-xs px-3 py-1.5 rounded-lg transition"
                  >
                    <X className="w-3.5 h-3.5" />
                    Reject
                  </button>
                </>
              )}
            </div>
          </div>

          <p className="text-sm text-slate-300 line-clamp-3 bg-slate-900/40 p-3 rounded-xl border border-slate-800/80">
            {app.pitchText}
          </p>

          <MatchScoreCard score={app.matchScore} summary={app.matchSummary} />
        </div>
      ))}
    </div>
  );
}
