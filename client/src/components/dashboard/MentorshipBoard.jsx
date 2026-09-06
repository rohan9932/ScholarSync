import React from 'react';
import MentorshipGroupCard from './MentorshipGroupCard.jsx';
import { Users, BookOpen } from 'lucide-react';

export default function MentorshipBoard({ mentorshipGroups = [] }) {
  if (!mentorshipGroups || mentorshipGroups.length === 0) {
    return (
      <div className="p-8 text-center bg-slate-800/30 rounded-2xl border border-slate-700/50">
        <p className="text-slate-400 text-sm">No accepted mentees yet. Accepted students will appear here grouped by research topic.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {mentorshipGroups.map((group, idx) => (
        <div key={idx} className="bg-slate-800/40 border border-slate-700/70 rounded-2xl p-5 space-y-4">
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-teal-400" />
            <h3 className="font-semibold text-white text-base">{group.topic || 'General Research'}</h3>
            <span className="text-xs bg-teal-950/60 text-teal-300 border border-teal-800/60 px-2.5 py-0.5 rounded-full ml-auto">
              {group.students?.length || 0} Mentees
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {group.students?.map((student) => (
              <MentorshipGroupCard key={student.id} student={student} />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
