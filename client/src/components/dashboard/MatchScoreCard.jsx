import React from 'react';
import { Award } from 'lucide-react';

export default function MatchScoreCard({ score, summary }) {
  if (score === null || score === undefined) {
    return (
      <div className="bg-slate-800/60 border border-slate-700/60 rounded-xl p-3 text-xs text-slate-400">
        <span>Scoring in progress or not available.</span>
      </div>
    );
  }

  const isHigh = score >= 80;
  const isMed = score >= 60 && score < 80;

  const badgeColor = isHigh
    ? 'text-emerald-400 bg-emerald-950/60 border-emerald-800/80'
    : isMed
    ? 'text-amber-400 bg-amber-950/60 border-amber-800/80'
    : 'text-rose-400 bg-rose-950/60 border-rose-800/80';

  return (
    <div className="bg-slate-800/40 border border-slate-700/60 rounded-xl p-3.5 space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-slate-400 flex items-center gap-1.5">
          <Award className="w-4 h-4 text-teal-400" />
          Research Match Fit
        </span>
        <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${badgeColor}`}>
          {score}% Match
        </span>
      </div>
      {summary && (
        <p className="text-xs text-slate-300 italic bg-slate-900/50 p-2.5 rounded-lg border border-slate-800">
          "{summary}"
        </p>
      )}
    </div>
  );
}
