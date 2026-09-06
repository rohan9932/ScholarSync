import React, { useState, useEffect } from 'react';
import { Calendar, Clock, AlertCircle, CheckCircle2, Check, Sparkles, User, Mail } from 'lucide-react';
import { createBooking } from '../../services/api.js';
import { useAuth } from '../../context/AuthContext.jsx';

export default function BookingCalendar({ facultyId, date, freeSlots = [], hasSchedule = true, isWeekend = false }) {
  const { user } = useAuth();

  const [selectedSlot, setSelectedSlot] = useState(null);
  const [studentName, setStudentName] = useState(user?.name || '');
  const [studentEmail, setStudentEmail] = useState(user?.email || '');
  const [isCustom, setIsCustom] = useState(false);
  const [customStart, setCustomStart] = useState('');
  const [customEnd, setCustomEnd] = useState('');
  const [status, setStatus] = useState({ state: 'idle', message: '' });

  useEffect(() => {
    if (user) {
      if (!studentName) setStudentName(user.name);
      if (!studentEmail) setStudentEmail(user.email);
    }
  }, [user]);

  const handleBook = async (e) => {
    e.preventDefault();
    if (!isCustom && !selectedSlot) return;

    setStatus({ state: 'loading', message: 'Submitting consultation slot booking...' });
    try {
      let slotStartIso;
      let slotEndIso;

      if (isCustom) {
        slotStartIso = new Date(customStart).toISOString();
        slotEndIso = new Date(customEnd).toISOString();
      } else {
        // Build ISO timestamp from date + slot.startTime
        slotStartIso = `${date}T${selectedSlot.startTime}:00.000Z`;
        slotEndIso = `${date}T${selectedSlot.endTime}:00.000Z`;
      }

      const payload = {
        facultyId,
        studentName,
        studentEmail,
        isCustom,
        slotStart: slotStartIso,
        slotEnd: slotEndIso,
      };

      const res = await createBooking(payload);
      setStatus({
        state: 'success',
        message: 'Consultation slot booked successfully! Awaiting faculty supervisor approval.',
      });
      setSelectedSlot(null);
    } catch (err) {
      setStatus({
        state: 'error',
        message: err.response?.data?.error || 'Failed to request booking slot.',
      });
    }
  };

  if (isWeekend) {
    return (
      <div className="bg-surface border border-white/[0.06] rounded-card p-8 text-center space-y-3">
        <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center mx-auto text-amber-400">
          <Calendar className="w-6 h-6" />
        </div>
        <h3 className="font-bold text-white text-base">Bangladesh Academic Weekend</h3>
        <p className="text-xs text-secondary max-w-md mx-auto">
          Friday and Saturday are university weekend days. University faculty are not scheduled for regular class periods. Please select a date between Sunday and Thursday.
        </p>
      </div>
    );
  }

  if (!hasSchedule) {
    return (
      <div className="bg-surface border border-white/[0.06] rounded-card p-8 text-center space-y-4">
        <div className="w-12 h-12 rounded-2xl bg-surface-alt border border-white/[0.06] flex items-center justify-center mx-auto text-amber-400">
          <AlertCircle className="w-6 h-6" />
        </div>
        <div>
          <h3 className="font-bold text-white text-base">No Routine Timetable on File</h3>
          <p className="text-xs text-secondary max-w-md mx-auto mt-1">
            This faculty member does not have weekly class schedule slots uploaded. You can submit a custom meeting consultation request.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsCustom(true)}
          className="text-xs bg-accent-600 hover:bg-accent-500 text-white font-semibold px-4 py-2.5 rounded-xl transition cursor-pointer"
        >
          Request Custom Meeting Slot
        </button>

        {isCustom && (
          <form onSubmit={handleBook} className="pt-4 border-t border-white/[0.06] max-w-md mx-auto space-y-3 text-left">
            <div className="grid grid-cols-2 gap-2.5">
              <div>
                <label className="block text-[11px] font-semibold text-secondary mb-1">Start Time</label>
                <input
                  type="datetime-local"
                  required
                  value={customStart}
                  onChange={(e) => setCustomStart(e.target.value)}
                  className="w-full bg-surface-alt border border-white/[0.06] text-xs text-white rounded-xl p-2.5 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-secondary mb-1">End Time</label>
                <input
                  type="datetime-local"
                  required
                  value={customEnd}
                  onChange={(e) => setCustomEnd(e.target.value)}
                  className="w-full bg-surface-alt border border-white/[0.06] text-xs text-white rounded-xl p-2.5 focus:outline-none"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={status.state === 'loading'}
              className="w-full bg-accent-600 hover:bg-accent-500 text-white font-bold text-xs py-3 rounded-xl transition"
            >
              Submit Custom Booking
            </button>
          </form>
        )}
      </div>
    );
  }

  return (
    <div className="bg-surface border border-white/[0.06] rounded-card p-6 sm:p-7 space-y-5 shadow-sm">
      <div className="flex items-center justify-between border-b border-white/[0.06] pb-3.5">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-surface-alt text-accent-400">
            <Clock className="w-4 h-4" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-accent-400 uppercase tracking-widest block">
              Computed Open Windows
            </span>
            <h3 className="font-bold text-white text-base">Available Consultation Slots</h3>
          </div>
        </div>

        <button
          type="button"
          onClick={() => {
            setIsCustom(!isCustom);
            setSelectedSlot(null);
          }}
          className="text-xs font-semibold text-accent-400 hover:text-accent-300 transition cursor-pointer"
        >
          {isCustom ? '← Pick from free periods' : '+ Request custom slot'}
        </button>
      </div>

      {!isCustom ? (
        <div className="space-y-3">
          {freeSlots.length === 0 ? (
            <div className="py-8 text-center text-xs text-muted">
              No free slots available on this date (fully scheduled or booked).
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {freeSlots.map((slot, i) => {
                const isSelected = selectedSlot?.startTime === slot.startTime;
                return (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setSelectedSlot(slot)}
                    className={`p-3.5 rounded-xl border text-left transition cursor-pointer ${
                      isSelected
                        ? 'bg-accent-600/20 border-accent-500 text-white shadow-sm'
                        : 'bg-surface-alt border-white/[0.06] text-secondary hover:text-white hover:border-accent-500/30'
                    }`}
                  >
                    <div className="font-bold text-xs text-white">
                      {slot.startTime} - {slot.endTime}
                    </div>
                    <div className="text-[10px] font-semibold text-accent-400 mt-1 uppercase tracking-wider">
                      {slot.day || 'Available'}
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-surface-alt/70 p-4 rounded-xl border border-white/[0.04]">
          <div>
            <label className="block text-xs font-semibold text-secondary mb-1.5">Custom Start Time</label>
            <input
              type="datetime-local"
              required
              value={customStart}
              onChange={(e) => setCustomStart(e.target.value)}
              className="w-full bg-surface border border-white/[0.06] text-xs text-white rounded-xl p-2.5 focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-secondary mb-1.5">Custom End Time</label>
            <input
              type="datetime-local"
              required
              value={customEnd}
              onChange={(e) => setCustomEnd(e.target.value)}
              className="w-full bg-surface border border-white/[0.06] text-xs text-white rounded-xl p-2.5 focus:outline-none"
            />
          </div>
        </div>
      )}

      {(selectedSlot || isCustom) && (
        <form onSubmit={handleBook} className="border-t border-white/[0.06] pt-5 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div className="relative">
              <User className="w-4 h-4 text-muted absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                required
                placeholder="Student Name"
                value={studentName}
                onChange={(e) => setStudentName(e.target.value)}
                className="w-full bg-surface-alt border border-white/[0.06] text-xs text-white rounded-xl pl-10 pr-3.5 py-2.5 focus:outline-none"
              />
            </div>
            <div className="relative">
              <Mail className="w-4 h-4 text-muted absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                placeholder="Student Email"
                value={studentEmail}
                onChange={(e) => setStudentEmail(e.target.value)}
                className="w-full bg-surface-alt border border-white/[0.06] text-xs text-white rounded-xl pl-10 pr-3.5 py-2.5 focus:outline-none"
              />
            </div>
          </div>

          {status.state === 'success' && (
            <div className="flex items-center gap-2 p-3 bg-accent-500/15 border border-accent-500/30 rounded-xl text-xs text-accent-400 font-medium">
              <CheckCircle2 className="w-4 h-4 text-accent-400 shrink-0" />
              <span>{status.message}</span>
            </div>
          )}

          {status.state === 'error' && (
            <div className="flex items-center gap-2 p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-xs text-rose-300">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
              <span>{status.message}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={status.state === 'loading'}
            className="w-full bg-accent-600 hover:bg-accent-500 disabled:opacity-50 text-white font-bold text-xs py-3 rounded-xl transition shadow-md shadow-accent-600/20 cursor-pointer"
          >
            {status.state === 'loading' ? 'Processing Booking...' : 'Confirm Consultation Booking'}
          </button>
        </form>
      )}
    </div>
  );
}
