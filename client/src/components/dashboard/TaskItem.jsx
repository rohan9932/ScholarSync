import React from 'react';
import { Clock, CheckCircle2, CircleDot, Trash2 } from 'lucide-react';

export default function TaskItem({ task, onStatusChange, onDelete }) {
  const isDone = task.status === 'DONE';

  return (
    <div
      className={`flex items-center justify-between p-3.5 rounded-xl border transition ${
        isDone
          ? 'bg-surface-alt/50 border-white/[0.04] text-muted'
          : 'bg-surface border border-white/[0.06] text-white hover:border-accent-500/20'
      }`}
    >
      <div className="flex items-start gap-3">
        <button
          onClick={() => onStatusChange?.(task.id, isDone ? 'PENDING' : 'DONE')}
          className="mt-0.5 text-accent-400 hover:text-accent-300 transition cursor-pointer"
          title={isDone ? 'Mark pending' : 'Mark done'}
        >
          {isDone ? (
            <CheckCircle2 className="w-4 h-4 text-accent-500" />
          ) : (
            <CircleDot className="w-4 h-4 text-muted hover:text-accent-400" />
          )}
        </button>
        <div>
          <h4 className={`text-sm font-semibold tracking-tight ${isDone ? 'line-through text-muted' : 'text-white'}`}>
            {task.title}
          </h4>
          {task.description && (
            <p className="text-xs text-secondary mt-0.5">{task.description}</p>
          )}
          <div className="flex items-center gap-1.5 text-[11px] text-muted mt-1 font-medium">
            <Clock className="w-3 h-3 text-accent-400" />
            <span>
              {new Date(task.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} -{' '}
              {new Date(task.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>
        </div>
      </div>

      {onDelete && (
        <button
          onClick={() => onDelete(task.id)}
          className="text-muted hover:text-rose-400 p-1.5 rounded-lg hover:bg-surface-raised transition cursor-pointer"
          title="Delete task"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}
