import React, { useState, useEffect } from 'react';
import BookingCalendar from '../components/student/BookingCalendar.jsx';
import { getFacultyList, getFacultyFreeSlots } from '../services/api.js';
import { Calendar, Clock, UserCheck, AlertCircle } from 'lucide-react';

export default function StudentBookingPage() {
  const [faculties, setFaculties] = useState([]);
  const [selectedFacultyId, setSelectedFacultyId] = useState('fac-001');
  const [date, setDate] = useState('2026-09-06');
  const [freeSlots, setFreeSlots] = useState([]);
  const [hasSchedule, setHasSchedule] = useState(true);
  const [isWeekend, setIsWeekend] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    getFacultyList()
      .then((data) => {
        if (data && data.length > 0) {
          setFaculties(data);
          setSelectedFacultyId(data[0].id);
        }
      })
      .catch((err) => {
        console.warn('Failed to load faculties:', err);
      });
  }, []);

  useEffect(() => {
    if (!selectedFacultyId || !date) return;

    setIsLoading(true);
    getFacultyFreeSlots(selectedFacultyId, date)
      .then((res) => {
        if (res) {
          setFreeSlots(res.freeSlots || []);
          setHasSchedule(res.hasSchedule !== false);
          setIsWeekend(res.isWeekend === true);
        }
      })
      .catch((err) => {
        console.warn('Failed to fetch free slots:', err);
      })
      .finally(() => setIsLoading(false));
  }, [selectedFacultyId, date]);

  const selectedFaculty = faculties.find((f) => f.id === selectedFacultyId);

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Eyebrow & Headline */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-accent-500/10 border border-accent-500/20 text-accent-400 text-xs font-bold uppercase tracking-wider">
          <Clock className="w-3.5 h-3.5" />
          <span>Dynamic Conflict-Free Availability</span>
        </div>
        <h1 className="text-3xl font-extrabold text-white tracking-tight">
          Book Faculty Consultation
        </h1>
        <p className="text-sm text-secondary max-w-lg mx-auto">
          Choose a faculty supervisor and pick an open slot automatically computed from classes, existing tasks, and approved bookings.
        </p>
      </div>

      {/* Selector Card */}
      <div className="bg-surface border border-white/[0.06] rounded-card p-5 sm:p-6 grid grid-cols-1 sm:grid-cols-2 gap-4 shadow-sm">
        <div>
          <label className="block text-xs font-bold text-accent-400 uppercase tracking-widest mb-1.5">
            Faculty Supervisor
          </label>
          <select
            value={selectedFacultyId}
            onChange={(e) => setSelectedFacultyId(e.target.value)}
            className="w-full bg-surface-alt border border-white/[0.06] focus:border-accent-500 text-sm text-white rounded-xl px-3.5 py-2.5 focus:outline-none appearance-none cursor-pointer"
          >
            {faculties.map((f) => (
              <option key={f.id} value={f.id} className="bg-surface text-white">
                {f.name} ({f.designation})
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-bold text-secondary uppercase tracking-wider mb-1.5">
            Consultation Date
          </label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full bg-surface-alt border border-white/[0.06] focus:border-accent-500 text-sm text-white rounded-xl px-3.5 py-2.5 focus:outline-none"
          />
        </div>
      </div>

      {/* Booking Calendar / Slots */}
      <BookingCalendar
        facultyId={selectedFacultyId}
        date={date}
        freeSlots={freeSlots}
        hasSchedule={hasSchedule}
        isWeekend={isWeekend}
      />
    </div>
  );
}
