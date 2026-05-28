'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { Send, Loader2, Bot, User, Plus, X, Zap } from 'lucide-react';
import { ChatMessage, ChatSource } from '@/types';
import { cn } from '@/lib/utils';
import { chatApi } from '@/lib/api';
import Cookies from 'js-cookie';
import ReactMarkdown from 'react-markdown';
import toast from 'react-hot-toast';

interface Props {
  sessionId?: string | null;
  videoIds?: string[];
  onSessionCreated?: (sessionId: string, title: string) => void;
}

interface StreamMessage extends ChatMessage {
  isStreaming?: boolean;
}

export function ChatInterface({ sessionId: initialSessionId, videoIds, onSessionCreated }: Props) {
  const [messages, setMessages] = useState<StreamMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(initialSessionId || null);
  const [sources, setSources] = useState<ChatSource[]>([]);
  const bottomRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Load session messages on mount
  useEffect(() => {
    if (initialSessionId) {
      loadSession(initialSessionId);
    }
  }, [initialSessionId]);

  const loadSession = async (id: string) => {
    try {
      const res = await chatApi.getSession(id);
      setMessages(res.data.messages || []);
      setSessionId(id);
    } catch {
      toast.error('Failed to load chat session');
    }
  };

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = useCallback(async () => {
    const content = input.trim();
    if (!content || loading) return;

    setInput('');
    setLoading(true);

    // Add user message immediately
    const userMsg: StreamMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content,
      created_at: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, userMsg]);

    // Add streaming placeholder
    const assistantId = `assistant-${Date.now()}`;
    const assistantMsg: StreamMessage = {
      id: assistantId,
      role: 'assistant',
      content: '',
      created_at: new Date().toISOString(),
      isStreaming: true,
    };
    setMessages((prev) => [...prev, assistantMsg]);

    try {
      const token = Cookies.get('access_token') || localStorage.getItem('access_token');
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/v1/chat/stream`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          content,
          session_id: sessionId,
          video_ids: videoIds || [],
        }),
      });

      if (!res.ok) throw new Error('Stream request failed');

      const reader = res.body?.getReader();
      const decoder = new TextDecoder();
      if (!reader) throw new Error('No reader');

      let fullContent = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6));

              if (data.type === 'session') {
                setSessionId(data.session_id);
                if (onSessionCreated) onSessionCreated(data.session_id, data.title);
              } else if (data.type === 'sources') {
                setSources(data.sources || []);
              } else if (data.type === 'token') {
                fullContent += data.content;
                setMessages((prev) =>
                  prev.map((m) =>
                    m.id === assistantId ? { ...m, content: fullContent } : m
                  )
                );
              } else if (data.type === 'done') {
                setMessages((prev) =>
                  prev.map((m) =>
                    m.id === assistantId ? { ...m, isStreaming: false } : m
                  )
                );
              } else if (data.type === 'error') {
                throw new Error(data.message);
              }
            } catch (e) {
              // Skip malformed SSE lines
            }
          }
        }
      }
    } catch (err: any) {
      setMessages((prev) => prev.filter((m) => m.id !== assistantId));
      toast.error('Failed to send message. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [input, loading, sessionId, videoIds, onSessionCreated]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const SUGGESTED_QUESTIONS = [
    'Why did this video perform well?',
    'How can I improve my hook?',
    'What emotional triggers are working?',
    'Give me 5 video ideas based on this content',
    'How can I increase watch time?',
  ];

  return (
    <div className="flex flex-col h-full">
      {/* Messages area */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center py-12">
            <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center mb-4">
              <Bot className="w-7 h-7 text-indigo-400" />
            </div>
            <h3 className="text-lg font-semibold text-white mb-1">CreatorIQ AI Chat</h3>
            <p className="text-sm text-slate-500 max-w-sm mb-6">
              Ask me anything about your videos. I'll analyze your content and give creator-focused insights.
            </p>
            <div className="flex flex-col gap-2 w-full max-w-sm">
              {SUGGESTED_QUESTIONS.map((q) => (
                <button
                  key={q}
                  onClick={() => { setInput(q); textareaRef.current?.focus(); }}
                  className="text-sm text-slate-400 hover:text-slate-200 bg-white/3 hover:bg-white/6 border border-white/6 hover:border-white/10 rounded-xl px-4 py-2.5 text-left transition-all"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((msg) => (
          <div key={msg.id} className={cn('flex gap-3', msg.role === 'user' ? 'justify-end' : 'justify-start')}>
            {msg.role === 'assistant' && (
              <div className="w-7 h-7 rounded-lg bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center flex-shrink-0 mt-0.5">
                <Bot className="w-3.5 h-3.5 text-indigo-400" />
              </div>
            )}

            <div className={cn(
              'max-w-[80%] rounded-2xl px-4 py-3 text-sm',
              msg.role === 'user'
                ? 'bg-indigo-600 text-white rounded-tr-sm'
                : 'bg-white/5 border border-white/6 text-slate-300 rounded-tl-sm'
            )}>
              {msg.role === 'assistant' ? (
                <div className={cn('prose prose-invert prose-sm max-w-none', msg.isStreaming && 'typing-cursor')}>
                  <ReactMarkdown>{msg.content || (msg.isStreaming ? ' ' : '')}</ReactMarkdown>
                </div>
              ) : (
                <p className="whitespace-pre-wrap">{msg.content}</p>
              )}

              {/* Sources */}
              {msg.role === 'assistant' && !msg.isStreaming && sources.length > 0 && msg.id === messages[messages.length - 1]?.id && (
                <div className="mt-3 pt-3 border-t border-white/8">
                  <p className="text-[10px] text-slate-500 mb-1.5">Sources from your library:</p>
                  <div className="flex flex-wrap gap-1">
                    {sources.map((s) => (
                      <span key={s.video_id} className="text-[10px] px-1.5 py-0.5 rounded-md bg-white/5 text-slate-400 border border-white/8">
                        {s.platform}: {(s.title || 'video').slice(0, 25)}...
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {msg.role === 'user' && (
              <div className="w-7 h-7 rounded-lg bg-white/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                <User className="w-3.5 h-3.5 text-slate-400" />
              </div>
            )}
          </div>
        ))}

        <div ref={bottomRef} />
      </div>

      {/* Input area */}
      <div className="border-t border-white/5 px-4 py-4">
        <div className="flex items-end gap-3 bg-white/4 border border-white/8 rounded-2xl p-3">
          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask about your videos... (Enter to send, Shift+Enter for newline)"
            rows={1}
            className="flex-1 bg-transparent text-sm text-slate-200 placeholder:text-slate-600 resize-none focus:outline-none min-h-[20px] max-h-[120px] leading-relaxed"
            style={{ height: 'auto' }}
            onInput={(e) => {
              const t = e.target as HTMLTextAreaElement;
              t.style.height = 'auto';
              t.style.height = `${Math.min(t.scrollHeight, 120)}px`;
            }}
          />
          <button
            onClick={sendMessage}
            disabled={loading || !input.trim()}
            className={cn(
              'w-8 h-8 rounded-xl flex items-center justify-center transition-all flex-shrink-0',
              loading || !input.trim()
                ? 'bg-white/5 text-slate-600 cursor-not-allowed'
                : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-500/25'
            )}
          >
            {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
          </button>
        </div>
        <p className="text-[10px] text-slate-600 mt-2 text-center">
          CreatorIQ AI · Powered by Gemini + RAG · References your video library
        </p>
      </div>
    </div>
  );
}
