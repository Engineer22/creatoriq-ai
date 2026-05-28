'use client';

import { useEffect, useState, useRef } from 'react';
import {
  Plus, MessageSquare, Trash2, Send, Loader2, Bot, User, Sparkles,
} from 'lucide-react';
import { chatApi } from '@/lib/api';
import toast from 'react-hot-toast';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  created_at: string;
}

interface Session {
  id: string;
  title: string;
  messages: Message[];
  updated_at: string;
}

function formatRelative(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return 'just now';
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

function cn(...c: (string | boolean | undefined)[]) {
  return c.filter(Boolean).join(' ');
}

// ─── Markdown-lite renderer ───────────────────────────────────────────────────
function MessageContent({ content }: { content: string }) {
  const lines = content.split('\n');
  return (
    <div className="text-sm leading-relaxed space-y-1.5">
      {lines.map((line, i) => {
        if (line.startsWith('**') && line.endsWith('**')) {
          return <p key={i} className="font-bold text-white">{line.slice(2, -2)}</p>;
        }
        if (line.startsWith('- ') || line.startsWith('• ')) {
          return <p key={i} className="flex gap-2"><span className="text-indigo-400 flex-shrink-0">·</span>{line.slice(2)}</p>;
        }
        if (/^\d+\./.test(line)) {
          return <p key={i} className="ml-4">{line}</p>;
        }
        if (line.startsWith('```') || line.startsWith('> ')) {
          return <p key={i} className="font-mono text-xs bg-black/30 px-3 py-2 rounded-lg text-slate-300">{line.replace(/^`{3}|^> /, '')}</p>;
        }
        if (line.trim() === '') return <div key={i} className="h-1" />;
        // Bold inline
        const parts = line.split(/(\*\*[^*]+\*\*)/g);
        return (
          <p key={i}>
            {parts.map((p, j) =>
              p.startsWith('**') && p.endsWith('**')
                ? <strong key={j} className="text-white font-semibold">{p.slice(2, -2)}</strong>
                : p
            )}
          </p>
        );
      })}
    </div>
  );
}

export default function ChatPage() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [loadingSessions, setLoadingSessions] = useState(true);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadSessions();
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (activeSessionId) loadMessages(activeSessionId);
    else setMessages([]);
  }, [activeSessionId]);

  const loadSessions = async () => {
    try {
      const res = await chatApi.listSessions();
      setSessions(res.data.sessions || []);
    } catch {
      console.error('Failed to load sessions');
    } finally {
      setLoadingSessions(false);
    }
  };

  const loadMessages = async (sessionId: string) => {
    try {
      const res = await chatApi.getMessages(sessionId);
      setMessages(res.data.messages || []);
    } catch {
      setMessages([]);
    }
  };

  const handleNewChat = () => {
    setActiveSessionId(null);
    setMessages([]);
  };

  const handleDeleteSession = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm('Delete this chat session?')) return;
    try {
      await chatApi.deleteSession(id);
      setSessions((prev) => prev.filter((s) => s.id !== id));
      if (activeSessionId === id) { setActiveSessionId(null); setMessages([]); }
      toast.success('Chat deleted');
    } catch {
      toast.error('Failed to delete chat');
    }
  };

  const handleSend = async () => {
    const content = input.trim();
    if (!content || sending) return;

    const optimisticMsg: Message = {
      id: `temp-${Date.now()}`,
      role: 'user',
      content,
      created_at: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, optimisticMsg]);
    setInput('');
    setSending(true);

    try {
      const res = await chatApi.sendMessage({
        content,
        session_id: activeSessionId,
      });

      const { session_id, session_title, message } = res.data;

      // Update/create session in sidebar
      if (!activeSessionId) {
        setActiveSessionId(session_id);
        setSessions((prev) => {
          const exists = prev.find((s) => s.id === session_id);
          if (exists) return prev;
          return [
            {
              id: session_id,
              title: session_title || content.slice(0, 50),
              messages: [],
              updated_at: new Date().toISOString(),
            },
            ...prev,
          ];
        });
      }

      const assistantMsg: Message = {
        id: message.id || `ai-${Date.now()}`,
        role: 'assistant',
        content: message.content,
        created_at: message.created_at || new Date().toISOString(),
      };

      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err: any) {
      toast.error(err?.response?.data?.detail || 'Failed to send message');
      // Remove optimistic message on failure
      setMessages((prev) => prev.filter((m) => m.id !== optimisticMsg.id));
    } finally {
      setSending(false);
    }
  };

  const STARTERS = [
    "How can I improve my hook score?",
    "What makes content go viral?",
    "Rewrite my CTA for better conversions",
    "Analyze the emotional triggers in my videos",
  ];

  return (
    <div className="flex h-[calc(100vh-64px)] -m-6 lg:-m-8 overflow-hidden">
      {/* Sidebar */}
      <div className="w-72 flex-shrink-0 border-r border-white/5 flex flex-col bg-[#070b13]">
        <div className="p-4 border-b border-white/5">
          <button
            onClick={handleNewChat}
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium transition-all"
          >
            <Plus className="w-4 h-4" /> New Chat
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-3 space-y-1">
          {loadingSessions ? (
            [...Array(4)].map((_, i) => (
              <div key={i} className="h-14 bg-white/3 rounded-xl animate-pulse" />
            ))
          ) : sessions.length === 0 ? (
            <div className="text-center py-10 text-slate-600 text-sm">
              <MessageSquare className="w-8 h-8 mx-auto mb-2 opacity-30" />
              No chats yet
            </div>
          ) : (
            sessions.map((s) => (
              <div
                key={s.id}
                onClick={() => setActiveSessionId(s.id)}
                className={cn(
                  'group flex items-center justify-between p-3 rounded-xl cursor-pointer transition-all',
                  activeSessionId === s.id
                    ? 'bg-indigo-500/10 border border-indigo-500/20'
                    : 'hover:bg-white/4 border border-transparent'
                )}
              >
                <div className="min-w-0 flex-1">
                  <p className={cn('text-sm truncate', activeSessionId === s.id ? 'text-indigo-300' : 'text-slate-300')}>
                    {s.title}
                  </p>
                  <p className="text-[10px] text-slate-600 mt-0.5">{formatRelative(s.updated_at)}</p>
                </div>
                <button
                  onClick={(e) => handleDeleteSession(s.id, e)}
                  className="opacity-0 group-hover:opacity-100 p-1 rounded-lg hover:bg-rose-500/10 text-slate-600 hover:text-rose-400 transition-all ml-1 flex-shrink-0"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Chat area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="border-b border-white/5 px-6 py-4 flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-indigo-500/15 border border-indigo-500/20 flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-indigo-400" />
          </div>
          <div>
            <p className="text-sm font-semibold text-white">CreatorIQ AI</p>
            <p className="text-[10px] text-slate-500">Your creator intelligence assistant</p>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
          {messages.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full gap-6 text-center">
              <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center">
                <Bot className="w-8 h-8 text-indigo-400" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-white mb-1">Ask me anything about your content</h2>
                <p className="text-slate-500 text-sm max-w-md">
                  I can analyze hooks, suggest improvements, rewrite scripts, and give you data-driven growth strategies.
                </p>
              </div>
              <div className="grid grid-cols-2 gap-2 w-full max-w-lg">
                {STARTERS.map((s) => (
                  <button
                    key={s}
                    onClick={() => { setInput(s); }}
                    className="text-left text-xs text-slate-400 hover:text-slate-200 p-3 rounded-xl border border-white/6 hover:border-white/12 bg-white/3 hover:bg-white/5 transition-all"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          {messages.map((msg) => (
            <div key={msg.id} className={cn('flex gap-3', msg.role === 'user' ? 'flex-row-reverse' : '')}>
              <div className={cn(
                'w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0',
                msg.role === 'user'
                  ? 'bg-indigo-600/20 border border-indigo-500/30'
                  : 'bg-white/5 border border-white/8'
              )}>
                {msg.role === 'user'
                  ? <User className="w-4 h-4 text-indigo-400" />
                  : <Bot className="w-4 h-4 text-slate-400" />}
              </div>
              <div className={cn(
                'max-w-[75%] rounded-2xl px-4 py-3',
                msg.role === 'user'
                  ? 'bg-indigo-600/20 border border-indigo-500/20 text-slate-200'
                  : 'bg-white/4 border border-white/6 text-slate-300'
              )}>
                <MessageContent content={msg.content} />
                <p className="text-[10px] text-slate-600 mt-2">{formatRelative(msg.created_at)}</p>
              </div>
            </div>
          ))}

          {sending && (
            <div className="flex gap-3">
              <div className="w-8 h-8 rounded-lg bg-white/5 border border-white/8 flex items-center justify-center">
                <Bot className="w-4 h-4 text-slate-400" />
              </div>
              <div className="bg-white/4 border border-white/6 rounded-2xl px-4 py-3">
                <div className="flex gap-1 items-center h-5">
                  {[0, 1, 2].map((i) => (
                    <div key={i} className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-bounce"
                      style={{ animationDelay: `${i * 0.15}s` }} />
                  ))}
                </div>
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <div className="border-t border-white/5 p-4">
          <div className="flex gap-3">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
              placeholder="Ask about hooks, viral potential, script improvements..."
              disabled={sending}
              className="flex-1 px-4 py-3 bg-white/5 border border-white/8 rounded-xl text-sm text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500/40 focus:bg-white/8 transition-all disabled:opacity-50"
            />
            <button
              onClick={handleSend}
              disabled={sending || !input.trim()}
              className="flex items-center gap-2 px-4 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-medium transition-all"
            >
              {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            </button>
          </div>
          <p className="text-[10px] text-slate-700 mt-2 text-center">Press Enter to send</p>
        </div>
      </div>
    </div>
  );
}
