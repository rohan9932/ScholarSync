import React, { useState, useEffect } from 'react';
import ApplicationForm from '../components/student/ApplicationForm.jsx';
import { getFacultyList } from '../services/api.js';
import { GraduationCap, Sparkles } from 'lucide-react';

export default function StudentApplyPage() {
  const [faculties, setFaculties] = useState([]);

  useEffect(() => {
    getFacultyList()
      .then((data) => {
        if (data && data.length > 0) {
          setFaculties(data);
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

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-950/60 border border-teal-800/80 text-teal-400 text-xs font-semibold">
          <Sparkles className="w-3.5 h-3.5" />
          AI Mentorship Match
        </div>
        <h1 className="text-3xl font-bold text-white">Apply for Faculty Mentorship</h1>
        <p className="text-sm text-slate-400">
          Submit your research proposal or thesis idea. Our semantic AI will evaluate your pitch against the faculty member's research publications and profile.
        </p>
      </div>

      <ApplicationForm faculties={faculties} />
    </div>
  );
}
