import React, { useState } from 'react';
import { MessageSquare, X, Send, Bot, Sparkles } from 'lucide-react';
import ChatBubble from './ChatBubble.jsx';
import ToolCallIndicator from './ToolCallIndicator.jsx';
import { postChatMessage } from '../../services/api.js';
import { useApp } from '../../context/AppContext.jsx';
import { useAuth } from '../../context/AuthContext.jsx';

export default function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: '1',
      sender: 'assistant',
      text: 'Hello! I am your ScholarSync AI scheduling assistant. Ask me to inspect your Sunday–Thursday timetable, find open gaps, or schedule new tasks.'
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [activeTool, setActiveTool] = useState(null);

  const { selectedFacultyId, currentDate } = useApp();
  const { user } = useAuth();

  const effectiveFacultyId = user?.facultyId || selectedFacultyId || 'fac-001';

  const handleSend = async (messageText) => {
    const textToSend = messageText || input;
    if (!textToSend.trim() || loading) return;

    const userMsg = { id: String(Date.now()), sender: 'user', text: textToSend.trim() };
    setMessages((prev) => [...prev, userMsg]);
    if (!messageText) setInput('');
    setLoading(true);
    setActiveTool('Analyzing query & checking tools...');

    try {
      const res = await postChatMessage({
        message: textToSend.trim(),
        facultyId: effectiveFacultyId,
        currentDate: currentDate || '2026-09-06',
        history: messages.map((m) => ({
          role: m.sender === 'user' ? 'user' : 'model',
          text: m.text,
        })),
      });

      if (res.toolCalls && res.toolCalls.length > 0) {
        const lastTool = res.toolCalls[res.toolCalls.length - 1];
        setActiveTool(`Executed ${lastTool.name}`);
      }

      setMessages((prev) => [
        ...prev,
        {
          id: String(Date.now() + 1),
          sender: 'assistant',
          text: res.reply || 'Task processed successfully.',
          toolCalls: res.toolCalls,
        },
      ]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          id: String(Date.now() + 1),
          sender: 'assistant',
          text: 'Sorry, I encountered an error connecting to the scheduling agent. Please ensure the server is active.',
        },
      ]);
    } finally {
      setLoading(false);
      setActiveTool(null);
    }
  };

  const quickPrompts = [
    "What is my schedule today?",
    "Find a 45-min free slot today",
    "Schedule a task 'Review Paper' from 2pm to 3pm",
  ];

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="flex items-center gap-2.5 bg-accent-600 hover:bg-accent-500 text-white px-5 py-3.5 rounded-full shadow-2xl shadow-accent-600/30 hover:scale-105 active:scale-95 transition cursor-pointer group"
          aria-label="Open AI Scheduling Assistant"
        >
          <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center">
            <Bot className="w-4 h-4" />
          </div>
          <span className="font-bold text-xs tracking-wide">AI Assistant</span>
        </button>
      )}

      {isOpen && (
        <div className="w-[380px] sm:w-[420px] h-[540px] bg-surface border border-white/[0.08] rounded-card shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150 backdrop-blur-2xl">
          {/* Header */}
          <div className="bg-surface-raised border-b border-white/[0.06] px-4 py-3.5 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="p-2 bg-accent-600/20 text-accent-400 rounded-xl border border-accent-500/30">
                <Bot className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white tracking-tight">ScholarSync AI</h3>
                <p className="text-[10px] text-accent-400 font-semibold uppercase tracking-wider">
                  Scheduling & Task Assistant
                </p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-secondary hover:text-white p-1.5 rounded-lg hover:bg-surface transition cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Messages body */}
          <div className="flex-1 overflow-y-auto p-4 space-y-2">
            {messages.map((m) => (
              <ChatBubble key={m.id} sender={m.sender} text={m.text} />
            ))}
            {loading && <ToolCallIndicator text={activeTool || "Analyzing schedule..."} />}
          </div>

          {/* Quick Starter Chips */}
          <div className="px-4 py-2 border-t border-white/[0.04] bg-surface-alt/40 flex items-center gap-1.5 overflow-x-auto">
            {quickPrompts.map((prompt, i) => (
              <button
                key={i}
                type="button"
                onClick={() => handleSend(prompt)}
                disabled={loading}
                className="text-[11px] whitespace-nowrap bg-surface-raised hover:bg-accent-600/20 border border-white/[0.06] hover:border-accent-500/30 text-secondary hover:text-accent-300 px-2.5 py-1 rounded-full transition cursor-pointer disabled:opacity-50 shrink-0"
              >
                {prompt}
              </button>
            ))}
          </div>

          {/* Input footer */}
          <form onSubmit={(e) => { e.preventDefault(); handleSend(); }} className="p-3 bg-surface-raised border-t border-white/[0.06] flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask anything about your timetable..."
              className="flex-1 bg-surface-alt border border-white/[0.06] focus:border-accent-500 text-xs text-white rounded-xl px-3.5 py-2.5 focus:outline-none placeholder-muted"
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="bg-accent-600 hover:bg-accent-500 disabled:opacity-50 text-white p-2.5 rounded-xl transition cursor-pointer shadow-md shadow-accent-600/20"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
