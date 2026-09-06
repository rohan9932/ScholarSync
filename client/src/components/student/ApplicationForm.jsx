import React, { useState } from 'react';
import { Send, CheckCircle2, AlertCircle } from 'lucide-react';
import { createApplication } from '../../services/api.js';

export default function ApplicationForm({ faculties = [] }) {
  const [formData, setFormData] = useState({
    facultyId: faculties[0]?.id || 'fac-001',
    studentName: '',
    studentEmail: '',
    studentContact: '',
    pitchText: '',
  });
  const [status, setStatus] = useState({ state: 'idle', message: '' });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.pitchText.trim()) return;

    setStatus({ state: 'loading', message: 'Submitting application & triggering AI evaluation...' });
    try {
      const res = await createApplication(formData);
      setStatus({
        state: 'success',
        message: res.message || 'Application received. AI fit scoring in progress.'
      });
      setFormData({
        facultyId: faculties[0]?.id || 'fac-001',
        studentName: '',
        studentEmail: '',
        studentContact: '',
        pitchText: '',
      });
    } catch (err) {
      setStatus({
        state: 'error',
        message: err.response?.data?.error || 'Failed to submit application. Please check backend connection.'
      });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-slate-800/40 border border-slate-700/70 rounded-2xl p-6 space-y-4">
      <div>
        <label className="block text-xs font-semibold text-slate-300 uppercase mb-1.5">
          Select Faculty
        </label>
        <select
          value={formData.facultyId}
          onChange={(e) => setFormData({ ...formData, facultyId: e.target.value })}
          className="w-full bg-slate-900 border border-slate-700 text-sm text-white rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-teal-500"
        >
          {faculties.map((f) => (
            <option key={f.id} value={f.id}>
              {f.name} — {f.designation}
            </option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-semibold text-slate-300 uppercase mb-1.5">
            Your Name
          </label>
          <input
            type="text"
            required
            value={formData.studentName}
            onChange={(e) => setFormData({ ...formData, studentName: e.target.value })}
            placeholder="e.g. Rafi Ahmed"
            className="w-full bg-slate-900 border border-slate-700 text-sm text-white rounded-xl px-3.5 py-2 focus:outline-none focus:border-teal-500"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-300 uppercase mb-1.5">
            University Email
          </label>
          <input
            type="email"
            required
            value={formData.studentEmail}
            onChange={(e) => setFormData({ ...formData, studentEmail: e.target.value })}
            placeholder="e.g. rafi@aust.edu"
            className="w-full bg-slate-900 border border-slate-700 text-sm text-white rounded-xl px-3.5 py-2 focus:outline-none focus:border-teal-500"
          />
        </div>
      </div>

      <div>
        <label className="block text-xs font-semibold text-slate-300 uppercase mb-1.5">
          Contact Number (WhatsApp / Messenger)
        </label>
        <input
          type="text"
          value={formData.studentContact}
          onChange={(e) => setFormData({ ...formData, studentContact: e.target.value })}
          placeholder="e.g. +8801700000000"
          className="w-full bg-slate-900 border border-slate-700 text-sm text-white rounded-xl px-3.5 py-2 focus:outline-none focus:border-teal-500"
        />
      </div>

      <div>
        <label className="block text-xs font-semibold text-slate-300 uppercase mb-1.5">
          Research Pitch & Proposal
        </label>
        <textarea
          rows={4}
          required
          value={formData.pitchText}
          onChange={(e) => setFormData({ ...formData, pitchText: e.target.value })}
          placeholder="Describe your background, research interests, and proposed thesis/project idea..."
          className="w-full bg-slate-900 border border-slate-700 text-sm text-white rounded-xl p-3 focus:outline-none focus:border-teal-500"
        />
      </div>

      {status.state === 'success' && (
        <div className="flex items-center gap-2 p-3 bg-emerald-950/50 border border-emerald-800 rounded-xl text-xs text-emerald-300">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{status.message}</span>
        </div>
      )}

      {status.state === 'error' && (
        <div className="flex items-center gap-2 p-3 bg-rose-950/50 border border-rose-800 rounded-xl text-xs text-rose-300">
          <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
          <span>{status.message}</span>
        </div>
      )}

      <button
        type="submit"
        disabled={status.state === 'loading'}
        className="flex items-center justify-center gap-2 w-full bg-teal-600 hover:bg-teal-500 disabled:opacity-50 text-white font-medium text-sm py-3 rounded-xl transition shadow-lg shadow-teal-900/30"
      >
        <Send className="w-4 h-4" />
        <span>{status.state === 'loading' ? 'Submitting...' : 'Submit Mentorship Application'}</span>
      </button>
    </form>
  );
}
