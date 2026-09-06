import React from 'react';
import { Sparkles, TrendingUp, AlertCircle } from 'lucide-react';

export default function MatchScoreCard({ score, summary }) {
  if (score === null || score === undefined) {
    return (
      <div className="bg-surface-alt border border-white/[0.06] rounded-xl p-3 text-xs text-muted flex items-center gap-2">
        <Sparkles className="w-4 h-4 text-accent-400 animate-pulse shrink-0" />
        <span>AI match evaluation in progress or research interests unlisted.</span>
      </div>
    );
  }

  const isHigh = score >= 75;
  const isMed = score >= 50 && score < 75;

  const badgeStyle = isHigh
    ? 'text-accent-400 bg-accent-500/15 border-accent-500/30'
    : isMed
    ? 'text-amber-400 bg-amber-500/15 border-amber-500/30'
    : 'text-rose-400 bg-rose-500/15 border-rose-500/30';

  return (
    <div className="bg-surface-alt border border-white/[0.06] rounded-xl p-3.5 space-y-2.5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-accent-400" />
          <span className="text-xs font-bold text-accent-400 uppercase tracking-wider">
            AI Semantic Fit
          </span>
        </div>
        <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold tracking-wide border ${badgeStyle}`}>
          {score}% Match
        </span>
      </div>

      {summary && (
        <p className="text-xs text-secondary leading-relaxed bg-surface border border-white/[0.04] p-3 rounded-lg">
          "{summary}"
        </p>
      )}
    </div>
  );
}
