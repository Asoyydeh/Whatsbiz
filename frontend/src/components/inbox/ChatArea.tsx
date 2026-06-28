'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import {
  Send,
  Paperclip,
  Smile,
  Phone,
  Video,
  MoreVertical,
  CheckCheck,
  Image as ImageIcon,
  FileText,
  Zap,
} from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/services/api';
import { useSocket } from '@/hooks/useSocket';
import { useAuthStore } from '@/store/useAuthStore';
import { cn } from '@/lib/utils';

interface Message {
  id: string;
  content: string;
  type: string;
  sender_id: string | null;
  status: string;
  created_at: string;
}

interface Props {
  conversationId: string;
  customerName: string;
  customerPhone: string;
}

const QUICK_REPLIES = [
  'Halo! Ada yang bisa kami bantu? 😊',
  'Terima kasih telah menghubungi kami!',
  'Pesanan Anda sedang kami proses.',
  'Pembayaran berhasil diterima ✅',
];

export function ChatArea({ conversationId, customerName, customerPhone }: Props) {
  const [inputValue, setInputValue] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [showQuickReplies, setShowQuickReplies] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimerRef = useRef<NodeJS.Timeout | undefined>(undefined);
  const { emit, on, off } = useSocket();
  const { user } = useAuthStore();
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['messages', conversationId],
    queryFn: () =>
      api.get(`/messages/conversations/${conversationId}/messages`).then((r) => r.data),
    enabled: !!conversationId,
  });

  useEffect(() => {
    if (data?.messages) setMessages(data.messages);
  }, [data]);

  // Join conversation room + listen for new messages
  useEffect(() => {
    if (!conversationId) return;
    emit('conversation:join', { conversationId });

    const handleNewMessage = (payload: { message: Message; conversationId: string }) => {
      if (payload.conversationId === conversationId) {
        setMessages((prev) => {
          const exists = prev.find((m) => m.id === payload.message.id);
          return exists ? prev : [...prev, payload.message];
        });
      }
    };

    const handleTyping = (payload: { conversationId: string; isTyping: boolean }) => {
      if (payload.conversationId === conversationId) {
        setIsTyping(payload.isTyping);
        if (payload.isTyping) {
          setTimeout(() => setIsTyping(false), 3000);
        }
      }
    };

    on('message:new', handleNewMessage);
    on('typing:update', handleTyping);

    return () => {
      off('message:new', handleNewMessage);
      off('typing:update', handleTyping);
    };
  }, [conversationId, emit, on, off]);

  // Auto scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const sendMessage = useCallback(
    (content: string) => {
      if (!content.trim() || !conversationId) return;

      emit('message:send', {
        conversation_id: conversationId,
        content: content.trim(),
        type: 'TEXT',
      });

      setInputValue('');
      setShowQuickReplies(false);
    },
    [conversationId, emit],
  );

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage(inputValue);
    }
  };

  const handleTypingEvent = () => {
    emit('typing:start', { conversationId });
    clearTimeout(typingTimerRef.current);
    typingTimerRef.current = setTimeout(() => {
      emit('typing:stop', { conversationId });
    }, 2000);
  };

  const isOwnMessage = (msg: Message) => msg.sender_id === user?.id || msg.sender_id === 'AI_BOT';

  const groupMessagesByDate = (msgs: Message[]) => {
    const groups: { date: string; messages: Message[] }[] = [];
    msgs.forEach((msg) => {
      const date = format(new Date(msg.created_at), 'dd MMMM yyyy', { locale: id });
      const lastGroup = groups[groups.length - 1];
      if (lastGroup?.date === date) {
        lastGroup.messages.push(msg);
      } else {
        groups.push({ date, messages: [msg] });
      }
    });
    return groups;
  };

  return (
    <div className="flex flex-col h-full bg-[#0d1117]">
      {/* Chat Header */}
      <div className="flex items-center justify-between px-5 py-3.5 border-b border-white/5 bg-[#111827]">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-white font-semibold text-sm">
            {customerName.charAt(0).toUpperCase()}
          </div>
          <div>
            <p className="text-sm font-semibold text-white">{customerName}</p>
            <p className="text-xs text-gray-500">{customerPhone}</p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <button className="p-2 rounded-lg hover:bg-white/10 text-gray-400 hover:text-white transition-colors">
            <Phone className="w-4 h-4" />
          </button>
          <button className="p-2 rounded-lg hover:bg-white/10 text-gray-400 hover:text-white transition-colors">
            <Video className="w-4 h-4" />
          </button>
          <button className="p-2 rounded-lg hover:bg-white/10 text-gray-400 hover:text-white transition-colors">
            <MoreVertical className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Messages Area */}
      <div
        className="flex-1 overflow-y-auto px-5 py-4 space-y-1 custom-scrollbar"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.02'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }}
      >
        {isLoading ? (
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div
                key={i}
                className={cn('flex', i % 2 === 0 ? 'justify-start' : 'justify-end')}
              >
                <div
                  className={cn(
                    'h-10 rounded-2xl animate-pulse',
                    i % 2 === 0 ? 'w-48 bg-white/10' : 'w-36 bg-emerald-500/20',
                  )}
                />
              </div>
            ))}
          </div>
        ) : (
          <>
            {groupMessagesByDate(messages).map((group) => (
              <div key={group.date}>
                {/* Date separator */}
                <div className="flex items-center gap-3 my-4">
                  <div className="flex-1 h-px bg-white/5" />
                  <span className="text-xs text-gray-600 px-3 py-1 bg-white/5 rounded-full">
                    {group.date}
                  </span>
                  <div className="flex-1 h-px bg-white/5" />
                </div>

                {group.messages.map((msg) => {
                  const isOwn = isOwnMessage(msg);
                  return (
                    <div
                      key={msg.id}
                      className={cn(
                        'flex mb-1',
                        isOwn ? 'justify-end' : 'justify-start',
                      )}
                    >
                      <div
                        className={cn(
                          'max-w-[70%] px-4 py-2.5 rounded-2xl text-sm relative group',
                          isOwn
                            ? 'bg-emerald-600 text-white rounded-br-md'
                            : 'bg-[#1e2533] text-gray-100 rounded-bl-md',
                        )}
                      >
                        <p className="whitespace-pre-wrap break-words">{msg.content}</p>
                        <div
                          className={cn(
                            'flex items-center gap-1 mt-1',
                            isOwn ? 'justify-end' : 'justify-start',
                          )}
                        >
                          <span className="text-[10px] opacity-60">
                            {format(new Date(msg.created_at), 'HH:mm')}
                          </span>
                          {msg.sender_id === 'AI_BOT' && (
                            <span className="text-[8px] font-extrabold bg-white/20 text-white/90 px-1 py-0.2 rounded uppercase">
                              AI
                            </span>
                          )}
                          {isOwn && (
                            <CheckCheck className="w-3 h-3 opacity-60" />
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ))}

            {/* Typing indicator */}
            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-[#1e2533] px-4 py-3 rounded-2xl rounded-bl-md">
                  <div className="flex gap-1 items-center h-4">
                    {[0, 1, 2].map((i) => (
                      <div
                        key={i}
                        className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce"
                        style={{ animationDelay: `${i * 0.15}s` }}
                      />
                    ))}
                  </div>
                </div>
              </div>
            )}
          </>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Quick Replies */}
      {showQuickReplies && (
        <div className="px-4 pb-2 flex flex-wrap gap-2">
          {QUICK_REPLIES.map((reply) => (
            <button
              key={reply}
              onClick={() => sendMessage(reply)}
              className="text-xs px-3 py-1.5 bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 rounded-full hover:bg-emerald-500/25 transition-colors"
            >
              {reply}
            </button>
          ))}
        </div>
      )}

      {/* Input Area */}
      <div className="px-4 py-3 border-t border-white/5 bg-[#111827]">
        <div className="flex items-end gap-2">
          <button
            onClick={() => setShowQuickReplies((v) => !v)}
            className={cn(
              'p-2.5 rounded-xl transition-colors flex-shrink-0',
              showQuickReplies
                ? 'bg-emerald-500/20 text-emerald-400'
                : 'hover:bg-white/10 text-gray-400 hover:text-white',
            )}
            title="Quick Replies"
          >
            <Zap className="w-4 h-4" />
          </button>
          <button className="p-2.5 rounded-xl hover:bg-white/10 text-gray-400 hover:text-white transition-colors flex-shrink-0">
            <Paperclip className="w-4 h-4" />
          </button>

          <div className="flex-1 relative">
            <textarea
              value={inputValue}
              onChange={(e) => {
                setInputValue(e.target.value);
                handleTypingEvent();
              }}
              onKeyDown={handleKeyDown}
              placeholder="Ketik pesan..."
              rows={1}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500/50 resize-none transition-all"
              style={{ maxHeight: '120px', overflowY: 'auto' }}
            />
          </div>

          <button
            onClick={() => sendMessage(inputValue)}
            disabled={!inputValue.trim()}
            className="p-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 disabled:opacity-30 disabled:cursor-not-allowed text-white transition-all flex-shrink-0 shadow-lg shadow-emerald-500/20"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
