import React from 'react';
import MentorshipGroupCard from './MentorshipGroupCard.jsx';
import { BookOpen, Users, FolderCheck } from 'lucide-react';

export default function MentorshipBoard({ mentorshipGroups = [] }) {
  if (!mentorshipGroups || mentorshipGroups.length === 0) {
    return (
      <div className="p-12 text-center bg-surface border border-white/[0.06] rounded-card space-y-3">
        <div className="w-12 h-12 rounded-2xl bg-surface-alt border border-white/[0.06] flex items-center justify-center mx-auto text-muted">
          <FolderCheck className="w-6 h-6" />
        </div>
        <h3 className="font-bold text-white text-base">No Accepted Mentees Yet</h3>
        <p className="text-secondary text-xs max-w-sm mx-auto">
          When you accept student proposals from the Applicants tab, they will automatically be organized here by research topic.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {mentorshipGroups.map((group, idx) => (
        <div key={idx} className="bg-surface border border-white/[0.06] rounded-card p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-white/[0.06] pb-3">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-lg bg-surface-alt text-accent-400">
                <BookOpen className="w-4 h-4" />
              </div>
              <div>
                <span className="text-[10px] font-bold text-accent-400 uppercase tracking-widest block">
                  Research Stream
                </span>
                <h3 className="font-bold text-white text-base">{group.topic || 'General Research'}</h3>
              </div>
            </div>

            <span className="text-xs font-bold bg-accent-500/10 text-accent-400 border border-accent-500/20 px-3 py-1 rounded-full">
              {group.students?.length || 0} Accepted
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
