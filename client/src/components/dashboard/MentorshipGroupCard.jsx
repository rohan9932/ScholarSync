import React from 'react';
import { MessageCircle, ExternalLink, Mail, Phone } from 'lucide-react';

export default function MentorshipGroupCard({ student }) {
  // Format WhatsApp link if contact provided
  const cleanPhone = (student.studentContact || '').replace(/[^0-9]/g, '');
  const whatsappUrl = cleanPhone ? `https://wa.me/${cleanPhone}` : null;

  return (
    <div className="bg-slate-900/60 border border-slate-700/60 rounded-xl p-4 flex flex-col justify-between space-y-3">
      <div>
        <h4 className="text-white font-medium text-sm">{student.studentName}</h4>
        <p className="text-xs text-slate-400 flex items-center gap-1.5 mt-1">
          <Mail className="w-3.5 h-3.5" />
          {student.studentEmail}
        </p>
        {student.studentContact && (
          <p className="text-xs text-slate-400 flex items-center gap-1.5 mt-0.5">
            <Phone className="w-3.5 h-3.5" />
            {student.studentContact}
          </p>
        )}
      </div>

      <div className="flex items-center gap-2 pt-2 border-t border-slate-800">
        {whatsappUrl && (
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-xs bg-emerald-600/20 text-emerald-400 hover:bg-emerald-600/30 border border-emerald-800/60 px-3 py-1.5 rounded-lg transition"
          >
            <MessageCircle className="w-3.5 h-3.5" />
            WhatsApp
          </a>
        )}
        <a
          href={`mailto:${student.studentEmail}`}
          className="flex items-center gap-1 text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 px-3 py-1.5 rounded-lg transition"
        >
          <Mail className="w-3.5 h-3.5" />
          Email
        </a>
      </div>
    </div>
  );
}
