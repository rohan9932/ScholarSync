import React from 'react';
import { Clock, CheckCircle2, CircleDot, Trash2 } from 'lucide-react';

export default function TaskItem({ task, onStatusChange, onDelete }) {
  const isDone = task.status === 'DONE';

  return (
    <div className={`flex items-center justify-between p-3 rounded-xl border transition ${
      isDone
        ? 'bg-slate-900/40 border-slate-800 text-slate-500'
        : 'bg-slate-800/60 border-slate-700/80 text-slate-200'
    }`}>
      <div className="flex items-start gap-3">
        <button
          onClick={() => onStatusChange?.(task.id, isDone ? 'PENDING' : 'DONE')}
          className="mt-0.5 text-teal-400 hover:text-teal-300"
        >
          {isDone ? <CheckCircle2 className="w-4 h-4 text-emerald-500" /> : <CircleDot className="w-4 h-4" />}
        </button>
        <div>
          <h4 className={`text-sm font-medium ${isDone ? 'line-through text-slate-500' : 'text-white'}`}>
            {task.title}
          </h4>
          {task.description && (
            <p className="text-xs text-slate-400 mt-0.5">{task.description}</p>
          )}
          <div className="flex items-center gap-2 text-xs text-slate-400 mt-1">
            <Clock className="w-3 h-3" />
            <span>{new Date(task.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - {new Date(task.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
          </div>
        </div>
      </div>

      {onDelete && (
        <button
          onClick={() => onDelete(task.id)}
          className="text-slate-500 hover:text-rose-400 p-1.5 rounded-lg hover:bg-slate-800 transition"
          title="Delete task"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}
