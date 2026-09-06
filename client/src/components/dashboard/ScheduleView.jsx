import React from 'react';
import { Calendar, Clock, BookOpen, CheckSquare, Users } from 'lucide-react';

const DAYS = ['SUN', 'MON', 'TUE', 'WED', 'THU'];

export default function ScheduleView({ slots = [], tasks = [], bookings = [] }) {
  return (
    <div className="bg-surface border border-white/[0.06] rounded-card p-5 space-y-5">
      {/* Header & Legend */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/[0.06] pb-4">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-surface-alt text-accent-400">
            <Calendar className="w-4 h-4" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-accent-400 uppercase tracking-widest block">
              Timetable & Commitments
            </span>
            <h3 className="font-bold text-white text-base">Weekly Schedule Grid</h3>
          </div>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-3 text-xs">
          <span className="flex items-center gap-1.5 text-secondary">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500/80"></span>
            Class / Busy
          </span>
          <span className="flex items-center gap-1.5 text-secondary">
            <span className="w-2.5 h-2.5 rounded-full bg-accent-500"></span>
            Free Period
          </span>
          <span className="flex items-center gap-1.5 text-secondary">
            <span className="w-2.5 h-2.5 rounded-full bg-teal-400"></span>
            Tasks
          </span>
          <span className="flex items-center gap-1.5 text-secondary">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400"></span>
            Bookings
          </span>
        </div>
      </div>

      {/* 5-Day Grid */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-3.5">
        {DAYS.map((day) => {
          const daySlots = slots.filter((s) => s.day === day);
          return (
            <div
              key={day}
              className="bg-surface-alt/60 border border-white/[0.04] rounded-xl p-3 space-y-2.5 flex flex-col"
            >
              <div className="text-center border-b border-white/[0.06] pb-2">
                <span className="text-xs font-bold text-accent-400 uppercase tracking-widest">
                  {day}
                </span>
              </div>

              <div className="space-y-2 flex-1 min-h-[160px]">
                {daySlots.length === 0 ? (
                  <p className="text-[11px] text-muted text-center py-8">No class slots</p>
                ) : (
                  daySlots.map((slot) => (
                    <div
                      key={slot.id || `${slot.day}-${slot.startTime}`}
                      className={`text-xs px-2.5 py-1.5 rounded-lg border transition ${
                        slot.type === 'BUSY'
                          ? 'bg-rose-950/30 border-rose-900/40 text-rose-300'
                          : 'bg-accent-500/10 border-accent-500/20 text-accent-300'
                      }`}
                    >
                      <div className="font-semibold text-[11px]">
                        {slot.startTime} - {slot.endTime}
                      </div>
                      <div className="text-[9px] uppercase tracking-wider font-bold opacity-75">
                        {slot.type === 'BUSY' ? 'Class' : 'Free Window'}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
