import React, { useState, useEffect } from 'react';
import ApplicationForm from '../components/student/ApplicationForm.jsx';
import { getFacultyList } from '../services/api.js';
import { Sparkles, BookOpen } from 'lucide-react';

export default function StudentApplyPage() {
  const [faculties, setFaculties] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getFacultyList()
      .then((data) => {
        if (data && data.length > 0) {
          setFaculties(data);
        }
      })
      .catch((err) => {
        console.warn('Failed to load faculty list:', err);
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Eyebrow & Title */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-accent-500/10 border border-accent-500/20 text-accent-400 text-xs font-bold uppercase tracking-wider">
          <Sparkles className="w-3.5 h-3.5" />
          <span>AI Mentorship Match</span>
        </div>
        <h1 className="text-3xl font-extrabold text-white tracking-tight">
          Apply for Faculty Mentorship
        </h1>
        <p className="text-sm text-secondary max-w-lg mx-auto">
          Submit your thesis proposal. Our semantic RAG pipeline evaluates your proposal against faculty research publications and research profiles.
        </p>
      </div>

      <ApplicationForm faculties={faculties} />
    </div>
  );
}
