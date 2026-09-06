import React, { useState } from 'react';
import { Calendar, Clock, AlertCircle, CheckCircle2 } from 'lucide-react';
import { createBooking } from '../../services/api.js';

export default function BookingCalendar({ facultyId, freeSlots = [], hasSchedule = true }) {
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [studentName, setStudentName] = useState('');
  const [studentEmail, setStudentEmail] = useState('');
  const [isCustom, setIsCustom] = useState(false);
  const [customStart, setCustomStart] = useState('');
  const [customEnd, setCustomEnd] = useState('');
  const [status, setStatus] = useState({ state: 'idle', message: '' });

  const handleBook = async (e) => {
    e.preventDefault();
    if (!isCustom && !selectedSlot) return;

    setStatus({ state: 'loading', message: 'Sending booking request...' });
    try {
      const payload = {
        facultyId,
        studentName,
        studentEmail,
        isCustom,
        slotStart: isCustom ? new Date(customStart).toISOString() : selectedSlot.slotStart,
        slotEnd: isCustom ? new Date(customEnd).toISOString() : selectedSlot.slotEnd,
      };

      await createBooking(payload);
      setStatus({ state: 'success', message: 'Booking requested successfully! Awaiting faculty confirmation.' });
      setSelectedSlot(null);
      setStudentName('');
      setStudentEmail('');
    } catch (err) {
      setStatus({ state: 'error', message: err.response?.data?.error || 'Failed to request booking.' });
    }
  };

  if (!hasSchedule) {
    return (
      <div className="bg-slate-800/40 border border-slate-700/60 rounded-2xl p-6 text-center space-y-3">
        <AlertCircle className="w-8 h-8 text-amber-400 mx-auto" />
        <h3 className="font-semibold text-white">No Official Timetable on File</h3>
        <p className="text-xs text-slate-400 max-w-md mx-auto">
          This faculty member does not have regular weekly timetable records uploaded. You can still submit a custom slot request.
        </p>
        <button
          onClick={() => setIsCustom(true)}
          className="text-xs bg-slate-700 hover:bg-slate-600 text-white px-4 py-2 rounded-xl"
        >
          Request Custom Meeting Time
        </button>
      </div>
    );
  }

  return (
    <div className="bg-slate-800/40 border border-slate-700/70 rounded-2xl p-6 space-y-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Clock className="w-5 h-5 text-teal-400" />
          <h3 className="font-semibold text-white text-base">Available Consultation Slots</h3>
        </div>
        <button
          type="button"
          onClick={() => setIsCustom(!isCustom)}
          className="text-xs text-teal-400 hover:underline"
        >
          {isCustom ? '← Pick from free slots' : '+ Request custom slot'}
        </button>
      </div>

      {!isCustom ? (
        <div className="space-y-3">
          {freeSlots.length === 0 ? (
            <p className="text-xs text-slate-400 py-4 text-center">No free slots computed for this date.</p>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              {freeSlots.map((slot, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setSelectedSlot(slot)}
                  className={`p-2.5 rounded-xl border text-xs font-medium transition text-left ${
                    selectedSlot === slot
                      ? 'bg-teal-600/30 border-teal-500 text-teal-300'
                      : 'bg-slate-900/50 border-slate-700/60 text-slate-300 hover:border-slate-500'
                  }`}
                >
                  <div className="font-semibold">{slot.startTime} - {slot.endTime}</div>
                  <div className="text-[10px] text-slate-400">{slot.day || 'Available'}</div>
                </button>
              ))}
            </div>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-slate-900/40 p-4 rounded-xl border border-slate-800">
          <div>
            <label className="block text-xs text-slate-400 mb-1">Start Time</label>
            <input
              type="datetime-local"
              value={customStart}
              onChange={(e) => setCustomStart(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 text-xs text-white rounded-lg p-2"
            />
          </div>
          <div>
            <label className="block text-xs text-slate-400 mb-1">End Time</label>
            <input
              type="datetime-local"
              value={customEnd}
              onChange={(e) => setCustomEnd(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 text-xs text-white rounded-lg p-2"
            />
          </div>
        </div>
      )}

      {(selectedSlot || isCustom) && (
        <form onSubmit={handleBook} className="border-t border-slate-700/80 pt-4 space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <input
              type="text"
              required
              placeholder="Your Name"
              value={studentName}
              onChange={(e) => setStudentName(e.target.value)}
              className="bg-slate-900 border border-slate-700 text-xs text-white rounded-xl px-3 py-2"
            />
            <input
              type="email"
              required
              placeholder="Your Email"
              value={studentEmail}
              onChange={(e) => setStudentEmail(e.target.value)}
              className="bg-slate-900 border border-slate-700 text-xs text-white rounded-xl px-3 py-2"
            />
          </div>

          {status.state === 'success' && (
            <div className="flex items-center gap-2 p-2.5 bg-emerald-950/50 border border-emerald-800 rounded-xl text-xs text-emerald-300">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{status.message}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={status.state === 'loading'}
            className="w-full bg-teal-600 hover:bg-teal-500 disabled:opacity-50 text-white font-medium text-xs py-2.5 rounded-xl transition"
          >
            {status.state === 'loading' ? 'Booking...' : 'Confirm Slot Booking'}
          </button>
        </form>
      )}
    </div>
  );
}
