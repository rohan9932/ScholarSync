import React, { useState, useEffect } from 'react';
import BookingCalendar from '../components/student/BookingCalendar.jsx';
import { getFacultyList, getFacultyFreeSlots } from '../services/api.js';
import { Calendar, Clock, UserCheck } from 'lucide-react';

export default function StudentBookingPage() {
  const [faculties, setFaculties] = useState([]);
  const [selectedFacultyId, setSelectedFacultyId] = useState('fac-001');
  const [date, setDate] = useState('2026-09-06');
  const [freeSlots, setFreeSlots] = useState([]);
  const [hasSchedule, setHasSchedule] = useState(true);

  useEffect(() => {
    getFacultyList()
      .then((data) => {
        if (data && data.length > 0) {
          setFaculties(data);
          setSelectedFacultyId(data[0].id);
        } else {
          setFaculties([
            { id: 'fac-001', name: 'Dr. Mohammad Shafiul Alam', designation: 'Professor' },
            { id: 'fac-002', name: 'Dr. Kazi A Kalpoma', designation: 'Professor' },
          ]);
        }
      })
      .catch(() => {
        setFaculties([
          { id: 'fac-001', name: 'Dr. Mohammad Shafiul Alam', designation: 'Professor' },
        ]);
      });
  }, []);

  useEffect(() => {
    if (!selectedFacultyId) return;

    getFacultyFreeSlots(selectedFacultyId, date)
      .then((res) => {
        if (res && res.freeSlots !== undefined) {
          setFreeSlots(res.freeSlots);
          setHasSchedule(res.hasSchedule !== false);
        } else {
          setFreeSlots([
            { startTime: '10:00', endTime: '10:50', day: 'SUN' },
            { startTime: '02:00', endTime: '02:50', day: 'SUN' },
          ]);
          setHasSchedule(true);
        }
      })
      .catch(() => {
        setFreeSlots([
          { startTime: '10:00', endTime: '10:50', day: 'SUN' },
          { startTime: '02:00', endTime: '02:50', day: 'SUN' },
        ]);
        setHasSchedule(true);
      });
  }, [selectedFacultyId, date]);

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-950/60 border border-teal-800/80 text-teal-400 text-xs font-semibold">
          <Clock className="w-3.5 h-3.5" />
          Smart Conflict-Free Booking
        </div>
        <h1 className="text-3xl font-bold text-white">Book Faculty Consultation</h1>
        <p className="text-sm text-slate-400">
          Select a faculty member to see open consultation windows automatically computed from their timetable and existing tasks.
        </p>
      </div>

      <div className="bg-slate-800/40 border border-slate-700/70 rounded-2xl p-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-semibold text-slate-300 uppercase mb-1.5">
            Faculty Member
          </label>
          <select
            value={selectedFacultyId}
            onChange={(e) => setSelectedFacultyId(e.target.value)}
            className="w-full bg-slate-900 border border-slate-700 text-sm text-white rounded-xl px-3 py-2.5 focus:outline-none focus:border-teal-500"
          >
            {faculties.map((f) => (
              <option key={f.id} value={f.id}>
                {f.name} ({f.designation})
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-300 uppercase mb-1.5">
            Select Date
          </label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full bg-slate-900 border border-slate-700 text-sm text-white rounded-xl px-3 py-2 focus:outline-none focus:border-teal-500"
          />
        </div>
      </div>

      <BookingCalendar
        facultyId={selectedFacultyId}
        freeSlots={freeSlots}
        hasSchedule={hasSchedule}
      />
    </div>
  );
}
