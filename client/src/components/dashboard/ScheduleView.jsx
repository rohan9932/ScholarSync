import React from 'react';
import { Calendar, Clock } from 'lucide-react';

const DAYS = ['SUN', 'MON', 'TUE', 'WED', 'THU'];

export default function ScheduleView({ slots = [], tasks = [], bookings = [] }) {
  return (
    <div className="bg-slate-800/40 border border-slate-700/70 rounded-2xl p-5 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Calendar className="w-5 h-5 text-teal-400" />
          <h3 className="font-semibold text-white text-base">Weekly Timetable & Schedule</h3>
        </div>
        <div className="flex items-center gap-4 text-xs">
          <span className="flex items-center gap-1.5 text-slate-300">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500/80"></span>
            Class / Busy
          </span>
          <span className="flex items-center gap-1.5 text-slate-300">
            <span className="w-2.5 h-2.5 rounded-full bg-teal-500"></span>
            Tasks
          </span>
          <span className="flex items-center gap-1.5 text-slate-300">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
            Bookings
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
        {DAYS.map((day) => {
          const daySlots = slots.filter((s) => s.day === day);
          return (
            <div key={day} className="bg-slate-900/50 border border-slate-800/80 rounded-xl p-3 space-y-2">
              <h4 className="text-xs font-semibold text-teal-400 uppercase tracking-wider text-center border-b border-slate-800 pb-1.5">
                {day}
              </h4>
              <div className="space-y-1.5 min-h-[140px]">
                {daySlots.length === 0 ? (
                  <p className="text-[11px] text-slate-500 text-center py-4">No class slots</p>
                ) : (
                  daySlots.map((slot) => (
                    <div
                      key={slot.id || `${slot.day}-${slot.startTime}`}
                      className={`text-[11px] px-2 py-1 rounded border ${
                        slot.type === 'BUSY'
                          ? 'bg-rose-950/40 border-rose-900/60 text-rose-300'
                          : 'bg-teal-950/40 border-teal-900/60 text-teal-300'
                      }`}
                    >
                      <div className="font-medium">{slot.startTime} - {slot.endTime}</div>
                      <div className="text-[10px] opacity-75">{slot.type}</div>
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
