'use client';

import { useRef, useEffect } from 'react';

interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
}

interface ConversationViewProps {
  messages: Message[];
  loading?: boolean;
}

export default function ConversationView({ messages, loading }: ConversationViewProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  // Filter out the initial "Starting session" user message
  const displayMessages = messages.filter(
    m => !(m.role === 'user' && m.content === 'Starting session')
  );

  return (
    <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
      {displayMessages.map((msg) => (
        <div
          key={msg.id}
          className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
        >
          <div
            className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed
              ${msg.role === 'user'
                ? 'bg-sky-600 text-white rounded-br-sm'
                : 'bg-zinc-100 text-zinc-900 rounded-bl-sm dark:bg-zinc-800 dark:text-zinc-100'
              }`}
          >
            {msg.role === 'assistant' && (
              <span className="text-[10px] font-semibold uppercase tracking-wider text-sky-600 dark:text-sky-400 block mb-1">
                CoAssure
              </span>
            )}
            <p className="whitespace-pre-wrap">{msg.content}</p>
          </div>
        </div>
      ))}

      {loading && (
        <div className="flex justify-start">
          <div className="bg-zinc-100 dark:bg-zinc-800 rounded-2xl rounded-bl-sm px-4 py-3">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-sky-600 dark:text-sky-400 block mb-1">
              CoAssure
            </span>
            <div className="flex gap-1.5">
              <span className="w-2 h-2 bg-zinc-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
              <span className="w-2 h-2 bg-zinc-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
              <span className="w-2 h-2 bg-zinc-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
          </div>
        </div>
      )}

      <div ref={bottomRef} />
    </div>
  );
}
