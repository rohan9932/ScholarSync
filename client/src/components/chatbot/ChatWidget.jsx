import React, { useState } from 'react';
import { MessageSquare, X, Send, Bot } from 'lucide-react';
import ChatBubble from './ChatBubble.jsx';
import ToolCallIndicator from './ToolCallIndicator.jsx';
import { postChatMessage } from '../../services/api.js';
import { useApp } from '../../context/AppContext.jsx';

export default function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: '1',
      sender: 'assistant',
      text: 'Hi Professor! I am your ScholarSync assistant. Ask me to check your calendar, find free slots, or schedule tasks.'
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const { selectedFacultyId, currentDate } = useApp();

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMsg = { id: String(Date.now()), sender: 'user', text: input };
    setMessages((prev) => [...prev, userMsg]);
    const currentInput = input;
    setInput('');
    setLoading(true);

    try {
      const res = await postChatMessage({
        message: currentInput,
        facultyId: selectedFacultyId,
        currentDate
      });

      setMessages((prev) => [
        ...prev,
        { id: String(Date.now() + 1), sender: 'assistant', text: res.reply }
      ]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        { id: String(Date.now() + 1), sender: 'assistant', text: 'Error contacting AI assistant. Please ensure backend is running.' }
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="flex items-center gap-2 bg-teal-600 hover:bg-teal-500 text-white p-4 rounded-full shadow-xl transition-transform hover:scale-105"
          aria-label="Open AI Scheduling Assistant"
        >
          <Bot className="w-6 h-6" />
          <span className="font-medium text-sm pr-1">AI Assistant</span>
        </button>
      )}

      {isOpen && (
        <div className="w-96 h-[520px] bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
          {/* Header */}
          <div className="bg-slate-800/90 border-b border-slate-700 px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-teal-500/20 text-teal-400 rounded-lg">
                <Bot className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-white">ScholarSync AI</h3>
                <p className="text-xs text-slate-400">Scheduling & Task Assistant</p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-700/50"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Messages body */}
          <div className="flex-1 overflow-y-auto p-4 space-y-2">
            {messages.map((m) => (
              <ChatBubble key={m.id} sender={m.sender} text={m.text} />
            ))}
            {loading && <ToolCallIndicator text="Analyzing schedule & available slots..." />}
          </div>

          {/* Input footer */}
          <form onSubmit={handleSend} className="p-3 bg-slate-800/50 border-t border-slate-700/80 flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="E.g. Find 1hr free slot on Sunday..."
              className="flex-1 bg-slate-900 border border-slate-700 text-sm text-white rounded-xl px-3 py-2 focus:outline-none focus:border-teal-500"
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="bg-teal-600 hover:bg-teal-500 disabled:opacity-50 text-white p-2.5 rounded-xl transition"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
