import React from 'react';
import { Loader2, Sparkles } from 'lucide-react';

export default function ToolCallIndicator({ text = "Checking schedule & timetable..." }) {
  return (
    <div className="flex items-center gap-2 text-xs text-accent-400 bg-accent-500/10 border border-accent-500/20 px-3.5 py-2 rounded-full w-fit my-2 shadow-sm animate-pulse">
      <Loader2 className="w-3.5 h-3.5 animate-spin text-accent-400" />
      <span className="font-semibold">{text}</span>
    </div>
  );
}
