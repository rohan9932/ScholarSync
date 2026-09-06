import React from 'react';
import MatchScoreCard from './MatchScoreCard.jsx';
import { Check, X, Mail, Phone, Users, Inbox } from 'lucide-react';

export default function ApplicantList({ applications = [], onDecide }) {
  if (!applications || applications.length === 0) {
    return (
      <div className="p-12 text-center bg-surface border border-white/[0.06] rounded-card space-y-3">
        <div className="w-12 h-12 rounded-2xl bg-surface-alt border border-white/[0.06] flex items-center justify-center mx-auto text-muted">
          <Inbox className="w-6 h-6" />
        </div>
        <h3 className="font-bold text-white text-base">No Applications Received Yet</h3>
        <p className="text-secondary text-xs max-w-sm mx-auto">
          Student research proposals submitted for your mentorship will appear here with automated AI fit evaluations.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {applications.map((app) => (
        <div
          key={app.id}
          className="bg-surface border border-white/[0.06] hover:border-accent-500/30 rounded-card p-5 transition space-y-4 shadow-sm"
        >
          {/* Header Row */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-white text-base tracking-tight">{app.studentName}</h3>
                <span
                  className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${
                    app.status === 'ACCEPTED'
                      ? 'bg-accent-500/15 text-accent-400 border-accent-500/30'
                      : app.status === 'REJECTED'
                      ? 'bg-rose-500/15 text-rose-400 border-rose-500/30'
                      : 'bg-amber-500/15 text-amber-400 border-amber-500/30'
                  }`}
                >
                  {app.status}
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-4 text-xs text-secondary mt-1">
                <span className="flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-muted" />
                  {app.studentEmail}
                </span>
                {app.studentContact && (
                  <span className="flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-muted" />
                    {app.studentContact}
                  </span>
                )}
              </div>
            </div>

            {/* Actions */}
            {app.status === 'PENDING' ? (
              <div className="flex items-center gap-2 self-end sm:self-auto">
                <button
                  onClick={() => onDecide?.(app.id, 'ACCEPTED')}
                  className="flex items-center gap-1.5 bg-accent-600 hover:bg-accent-500 text-white font-semibold text-xs px-3.5 py-1.5 rounded-lg transition shadow-md shadow-accent-600/20 active:scale-95 cursor-pointer"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>Accept Pitch</span>
                </button>
                <button
                  onClick={() => onDecide?.(app.id, 'REJECTED')}
                  className="flex items-center gap-1.5 bg-surface-alt hover:bg-rose-500/20 text-secondary hover:text-rose-300 border border-white/[0.06] hover:border-rose-500/30 text-xs px-3.5 py-1.5 rounded-lg transition active:scale-95 cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                  <span>Decline</span>
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2 self-end sm:self-auto">
                {app.status === 'ACCEPTED' ? (
                  <span className="text-xs font-semibold text-accent-400 bg-accent-500/10 border border-accent-500/20 px-3 py-1 rounded-lg flex items-center gap-1.5">
                    <Check className="w-3.5 h-3.5" />
                    <span>Mentorship Active</span>
                  </span>
                ) : (
                  <span className="text-xs font-semibold text-rose-400 bg-rose-500/10 border border-rose-500/20 px-3 py-1 rounded-lg flex items-center gap-1.5">
                    <X className="w-3.5 h-3.5" />
                    <span>Declined</span>
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Student Pitch Text */}
          <div className="bg-surface-alt/70 border border-white/[0.04] p-3.5 rounded-xl text-sm text-secondary leading-relaxed">
            <span className="text-[11px] font-bold text-accent-400 uppercase tracking-widest block mb-1">
              Proposal Pitch
            </span>
            "{app.pitchText}"
          </div>

          {/* AI Match Score Evaluation */}
          <MatchScoreCard score={app.matchScore} summary={app.matchSummary} />
        </div>
      ))}
    </div>
  );
}
