import React from 'react';

export default function ChatBubble({ sender, text }) {
  const isUser = sender === 'user';
  return (
    <div className={`flex w-full ${isUser ? 'justify-end' : 'justify-start'} my-2`}>
      <div
        className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm shadow-sm ${
          isUser
            ? 'bg-teal-600 text-white rounded-br-none'
            : 'bg-slate-800 text-slate-100 border border-slate-700 rounded-bl-none'
        }`}
      >
        <p className="whitespace-pre-wrap">{text}</p>
      </div>
    </div>
  );
}
