import React from 'react';
import { Loader2 } from 'lucide-react';

export default function ToolCallIndicator({ text = "Checking schedule & availability..." }) {
  return (
    <div className="flex items-center gap-2 text-xs text-teal-400 bg-teal-950/40 border border-teal-800/60 px-3 py-1.5 rounded-full w-fit my-2 animate-pulse">
      <Loader2 className="w-3.5 h-3.5 animate-spin text-teal-400" />
      <span>{text}</span>
    </div>
  );
}
