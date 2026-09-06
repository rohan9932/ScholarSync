import React from 'react';
import { MessageCircle, Mail, Phone } from 'lucide-react';

export default function MentorshipGroupCard({ student }) {
  const cleanPhone = (student.studentContact || '').replace(/[^0-9]/g, '');
  const whatsappUrl = cleanPhone ? `https://wa.me/${cleanPhone}` : null;

  return (
    <div className="bg-surface border border-white/[0.06] hover:border-accent-500/20 rounded-card p-4.5 flex flex-col justify-between space-y-3.5 transition shadow-sm">
      <div>
        <div className="flex items-center justify-between">
          <h4 className="text-white font-bold text-sm tracking-tight">{student.studentName}</h4>
          <div className="flex items-center gap-1.5">
            {student.matchScore != null && (
              <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-accent-500/15 text-accent-400 border border-accent-500/30">
                {Math.round(student.matchScore)}% Fit
              </span>
            )}
            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-accent-500/10 text-accent-400 border border-accent-500/20">
              Mentee
            </span>
          </div>
        </div>

        {student.pitchText && (
          <p className="text-xs text-secondary/80 italic line-clamp-2 mt-2 bg-surface-alt/60 p-2 rounded-lg border border-white/[0.04]">
            "{student.pitchText}"
          </p>
        )}

        <div className="space-y-1 mt-2.5 text-xs text-secondary">
          <p className="flex items-center gap-1.5">
            <Mail className="w-3.5 h-3.5 text-muted shrink-0" />
            <span className="truncate">{student.studentEmail}</span>
          </p>
          {student.studentContact && (
            <p className="flex items-center gap-1.5">
              <Phone className="w-3.5 h-3.5 text-muted shrink-0" />
              <span>{student.studentContact}</span>
            </p>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2 pt-3 border-t border-white/[0.04]">
        {whatsappUrl && (
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 flex items-center justify-center gap-1.5 text-xs font-semibold bg-accent-600/20 text-accent-400 hover:bg-accent-600/30 border border-accent-500/30 py-2 rounded-lg transition"
          >
            <MessageCircle className="w-3.5 h-3.5" />
            <span>WhatsApp</span>
          </a>
        )}
        <a
          href={`mailto:${student.studentEmail}`}
          className="flex-1 flex items-center justify-center gap-1.5 text-xs font-semibold bg-surface-alt hover:bg-surface-raised text-secondary hover:text-white border border-white/[0.06] py-2 rounded-lg transition"
        >
          <Mail className="w-3.5 h-3.5" />
          <span>Email</span>
        </a>
      </div>
    </div>
  );
}
