'use client';

import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import {
  AssistantApi,
  ASSISTANT_WELCOME,
  ASSISTANT_SUGGESTIONS,
  type ChatMessage,
} from '@/services/assistant';
import { IconBot, IconClose, IconSend } from '@/components/ui/Icons';

const HISTORY_KEY = 'afc:assistant-history';
const uid = () => `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;

function loadHistory(): ChatMessage[] {
  try {
    const raw = window.localStorage.getItem(HISTORY_KEY);
    return raw ? (JSON.parse(raw) as ChatMessage[]) : [];
  } catch {
    return [];
  }
}

export function AssistantWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [typing, setTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const history = loadHistory();
    setMessages(
      history.length
        ? history
        : [
            {
              id: uid(),
              role: 'assistant',
              content: ASSISTANT_WELCOME,
              createdAt: new Date().toISOString(),
            },
          ]
    );
  }, []);

  // Persist conversation
  useEffect(() => {
    try {
      window.localStorage.setItem(HISTORY_KEY, JSON.stringify(messages));
    } catch {
      /* ignore */
    }
  }, [messages]);

  // Autoscroll
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages, typing]);

  const ask = async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || typing) return;
    const userMsg = { id: uid(), role: 'user' as const, content: trimmed, createdAt: new Date().toISOString() };
    setMessages((m) => [...m, userMsg]);
    setInput('');
    setTyping(true);
    try {
      const res = await AssistantApi.ask([...messages, userMsg]);
      setTyping(false);
      setMessages((m) => [
        ...m,
        { id: uid(), role: 'assistant', content: res.reply, createdAt: new Date().toISOString() },
      ]);
    } catch {
      setTyping(false);
      setMessages((m) => [
        ...m,
        {
          id: uid(),
          role: 'assistant',
          content: 'Lo siento, hubo un problema. Intenta de nuevo en un momento.',
          createdAt: new Date().toISOString(),
        },
      ]);
    }
  };

  const reset = () => {
    try {
      window.localStorage.removeItem(HISTORY_KEY);
    } catch {
      /* ignore */
    }
    setMessages([
      { id: uid(), role: 'assistant', content: ASSISTANT_WELCOME, createdAt: new Date().toISOString() },
    ]);
  };

  return (
    <div className="fixed bottom-5 left-5 z-[90] flex flex-col items-start gap-3">
      {open && (
        <motion.div
          initial={{ y: 24, opacity: 0, scale: 0.97 }}
          animate={{ y: 0, opacity: 1, scale: 1 }}
          exit={{ y: 24, opacity: 0, scale: 0.97 }}
          transition={{ type: 'spring', damping: 30, stiffness: 300 }}
          className="flex h-[540px] w-[min(92vw,400px)] flex-col overflow-hidden rounded-3xl border border-line bg-surface shadow-card-hover"
        >
          {/* Header */}
          <div className="flex items-center justify-between bg-ink px-4 py-3.5 text-ivory">
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-gold text-ink">
                <IconBot size={22} />
              </span>
              <div>
                <p className="font-display text-base leading-tight">Asistente AFC</p>
                <p className="flex items-center gap-1.5 text-xs text-ivory/60">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                  En línea
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <button onClick={reset} className="rounded-full px-3 py-1 text-xs text-ivory/60 transition-colors hover:bg-ivory/10">
                Nuevo
              </button>
              <button onClick={() => setOpen(false)} aria-label="Cerrar" className="rounded-full p-2 transition-colors hover:bg-ivory/10">
                <IconClose size={20} />
              </button>
            </div>
          </div>

          {/* Messages */}
          <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto px-4 py-4">
            {messages.length === 0 && (
              <div className="space-y-2">
                {ASSISTANT_SUGGESTIONS.map((s) => (
                  <button
                    key={s}
                    onClick={() => ask(s)}
                    className="block w-full rounded-2xl border border-line px-4 py-2.5 text-left text-sm text-charcoal transition-colors hover:border-gold hover:text-gold-dark"
                  >
                    {s}
                  </button>
                ))}
              </div>
            )}
            {messages.map((m) => (
              <div key={m.id} className={m.role === 'user' ? 'flex justify-end' : 'flex justify-start'}>
                <div
                  className={
                    m.role === 'user'
                      ? 'max-w-[85%] rounded-2xl rounded-br-sm bg-gold px-4 py-2.5 text-sm text-ink'
                      : 'max-w-[85%] rounded-2xl rounded-bl-sm border border-line bg-mist px-4 py-2.5 text-sm text-ink'
                  }
                >
                  {m.content}
                </div>
              </div>
            ))}
            {typing && (
              <div className="flex justify-start">
                <div className="flex items-center gap-1 rounded-2xl rounded-bl-sm border border-line bg-mist px-4 py-3">
                  {[0, 1, 2].map((i) => (
                    <span
                      key={i}
                      className="h-1.5 w-1.5 animate-bounce rounded-full bg-charcoal/50"
                      style={{ animationDelay: `${i * 0.15}s` }}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Input */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              ask(input);
            }}
            className="flex items-center gap-2 border-t border-line p-3"
          >
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Escribe tu consulta…"
              aria-label="Escribe tu consulta"
              className="flex-1 rounded-full border border-line bg-mist px-4 py-2.5 text-sm text-ink placeholder:text-charcoal/50 focus:border-gold focus:outline-none"
            />
            <button
              type="submit"
              disabled={!input.trim() || typing}
              aria-label="Enviar"
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gold text-ink transition-opacity disabled:opacity-40"
            >
              <IconSend size={18} />
            </button>
          </form>
        </motion.div>
      )}

      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-label={open ? 'Cerrar asistente' : 'Abrir asistente'}
        className="flex h-14 w-14 items-center justify-center rounded-full bg-ink text-gold shadow-lg shadow-ink/30 transition-transform hover:scale-105"
      >
        {open ? <IconClose size={26} /> : <IconBot size={26} />}
      </button>
    </div>
  );
}