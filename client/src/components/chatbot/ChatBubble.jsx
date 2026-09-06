import React from 'react';

export default function ChatBubble({ sender, text }) {
  const isUser = sender === 'user';
  return (
    <div className={`flex w-full ${isUser ? 'justify-end' : 'justify-start'} my-2`}>
      <div
        className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-xs sm:text-sm leading-relaxed ${
          isUser
            ? 'bg-accent-600 text-white rounded-br-xs shadow-md shadow-accent-600/15'
            : 'bg-surface-alt border border-white/[0.08] text-secondary rounded-bl-xs'
        }`}
      >
        <p className="whitespace-pre-wrap">{text}</p>
      </div>
    </div>
  );
}
