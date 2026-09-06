import React, { useState, useEffect } from 'react';
import { Send, CheckCircle2, AlertCircle, Sparkles, User, Mail, Phone, BookOpen } from 'lucide-react';
import { createApplication } from '../../services/api.js';
import { useAuth } from '../../context/AuthContext.jsx';

export default function ApplicationForm({ faculties = [] }) {
  const { user } = useAuth();

  const [formData, setFormData] = useState({
    facultyId: faculties[0]?.id || 'fac-001',
    studentName: user?.name || '',
    studentEmail: user?.email || '',
    studentContact: '+8801700000000',
    pitchText: '',
  });

  useEffect(() => {
    if (user) {
      setFormData((prev) => ({
        ...prev,
        studentName: user.name || prev.studentName,
        studentEmail: user.email || prev.studentEmail,
      }));
    }
  }, [user]);

  useEffect(() => {
    if (faculties.length > 0 && !formData.facultyId) {
      setFormData((prev) => ({ ...prev, facultyId: faculties[0].id }));
    }
  }, [faculties]);

  const [status, setStatus] = useState({ state: 'idle', message: '' });

  const selectedFaculty = faculties.find((f) => f.id === formData.facultyId);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.pitchText.trim()) return;

    setStatus({ state: 'loading', message: 'Submitting proposal & scoring match with Gemini vector RAG...' });
    try {
      const res = await createApplication(formData);
      setStatus({
        state: 'success',
        message: res.message || 'Application successfully received! AI match evaluation is in progress.',
      });
      setFormData((prev) => ({
        ...prev,
        pitchText: '',
      }));
    } catch (err) {
      setStatus({
        state: 'error',
        message: err.response?.data?.error || 'Failed to submit proposal. Please check server connection.',
      });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-surface border border-white/[0.06] rounded-card p-6 sm:p-8 space-y-5 shadow-sm">
      {/* Faculty Picker */}
      <div>
        <label className="block text-xs font-bold text-accent-400 uppercase tracking-widest mb-1.5">
          Choose Faculty Supervisor
        </label>
        <div className="relative">
          <select
            value={formData.facultyId}
            onChange={(e) => setFormData({ ...formData, facultyId: e.target.value })}
            className="w-full bg-surface-alt border border-white/[0.06] focus:border-accent-500 text-sm text-white rounded-xl px-4 py-3 focus:outline-none appearance-none cursor-pointer"
          >
            {faculties.map((f) => (
              <option key={f.id} value={f.id} className="bg-surface text-white">
                {f.name} — {f.designation}
              </option>
            ))}
          </select>
        </div>

        {selectedFaculty?.researchInterests && selectedFaculty.researchInterests.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2.5">
            {selectedFaculty.researchInterests.map((tag, i) => (
              <span key={i} className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-surface-raised border border-white/[0.04] text-accent-300">
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-bold text-secondary uppercase tracking-wider mb-1.5">
            Your Full Name
          </label>
          <div className="relative">
            <User className="w-4 h-4 text-muted absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              required
              value={formData.studentName}
              onChange={(e) => setFormData({ ...formData, studentName: e.target.value })}
              placeholder="e.g. Rafi Ahmed"
              className="w-full bg-surface-alt border border-white/[0.06] focus:border-accent-500 text-sm text-white rounded-xl pl-10 pr-3.5 py-2.5 focus:outline-none"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-secondary uppercase tracking-wider mb-1.5">
            University Email
          </label>
          <div className="relative">
            <Mail className="w-4 h-4 text-muted absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="email"
              required
              value={formData.studentEmail}
              onChange={(e) => setFormData({ ...formData, studentEmail: e.target.value })}
              placeholder="rafi@aust.edu"
              className="w-full bg-surface-alt border border-white/[0.06] focus:border-accent-500 text-sm text-white rounded-xl pl-10 pr-3.5 py-2.5 focus:outline-none"
            />
          </div>
        </div>
      </div>

      <div>
        <label className="block text-xs font-bold text-secondary uppercase tracking-wider mb-1.5">
          Contact Number (WhatsApp / Phone)
        </label>
        <div className="relative">
          <Phone className="w-4 h-4 text-muted absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={formData.studentContact}
            onChange={(e) => setFormData({ ...formData, studentContact: e.target.value })}
            placeholder="+8801700000000"
            className="w-full bg-surface-alt border border-white/[0.06] focus:border-accent-500 text-sm text-white rounded-xl pl-10 pr-3.5 py-2.5 focus:outline-none"
          />
        </div>
      </div>

      <div>
        <label className="block text-xs font-bold text-secondary uppercase tracking-wider mb-1.5">
          Research Pitch & Thesis Proposal
        </label>
        <textarea
          rows={4}
          required
          value={formData.pitchText}
          onChange={(e) => setFormData({ ...formData, pitchText: e.target.value })}
          placeholder="Outline your research question, methodologies (e.g. computer vision, NLP, RL), and why this faculty member's lab aligns with your academic goals..."
          className="w-full bg-surface-alt border border-white/[0.06] focus:border-accent-500 text-sm text-white rounded-xl p-3.5 focus:outline-none resize-none leading-relaxed"
        />
      </div>

      {status.state === 'loading' && (
        <div className="flex items-center gap-2 p-3 bg-accent-500/10 border border-accent-500/20 rounded-xl text-xs text-accent-300 animate-pulse">
          <Sparkles className="w-4 h-4 text-accent-400 shrink-0" />
          <span>{status.message}</span>
        </div>
      )}

      {status.state === 'success' && (
        <div className="flex items-center gap-2 p-3.5 bg-accent-500/15 border border-accent-500/30 rounded-xl text-xs text-accent-400 font-medium">
          <CheckCircle2 className="w-4 h-4 text-accent-400 shrink-0" />
          <span>{status.message}</span>
        </div>
      )}

      {status.state === 'error' && (
        <div className="flex items-center gap-2 p-3.5 bg-rose-500/10 border border-rose-500/30 rounded-xl text-xs text-rose-300">
          <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
          <span>{status.message}</span>
        </div>
      )}

      <button
        type="submit"
        disabled={status.state === 'loading'}
        className="flex items-center justify-center gap-2 w-full bg-accent-600 hover:bg-accent-500 disabled:opacity-50 text-white font-bold text-sm py-3.5 rounded-xl transition shadow-lg shadow-accent-600/20 active:scale-[0.99] cursor-pointer"
      >
        <Send className="w-4 h-4" />
        <span>{status.state === 'loading' ? 'Submitting Application...' : 'Submit Proposal for AI Matching'}</span>
      </button>
    </form>
  );
}
