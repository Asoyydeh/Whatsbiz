'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { id } from 'date-fns/locale';
import { Search, Filter, MessageSquare, Clock, CheckCheck } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/services/api';
import { useSocket } from '@/hooks/useSocket';
import { cn } from '@/lib/utils';

interface Conversation {
  id: string;
  customer: {
    id: string;
    name: string;
    phone: string;
    status: string;
    tags: { tag: string }[];
  };
  last_message: string | null;
  unread_count: number;
  status: string;
  updated_at: string;
}

interface Props {
  selectedId: string | null;
  onSelect: (conv: Conversation) => void;
}

const statusColors: Record<string, string> = {
  LEAD: 'bg-yellow-400',
  CUSTOMER: 'bg-emerald-400',
  VIP: 'bg-purple-400',
  PROSPECT: 'bg-blue-400',
  INACTIVE: 'bg-gray-400',
};

export function ConversationList({ selectedId, onSelect }: Props) {
  const [search, setSearch] = useState('');
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const { on, off } = useSocket();

  const { data, isLoading } = useQuery({
    queryKey: ['conversations'],
    queryFn: () => api.get('/messages/conversations').then((r) => r.data),
    refetchInterval: false,
  });

  useEffect(() => {
    if (data) setConversations(data);
  }, [data]);

  // Real-time: update conversation list when new message arrives
  useEffect(() => {
    const handleNewMessage = (payload: { message: any; conversationId: string }) => {
      setConversations((prev) =>
        prev.map((c) =>
          c.id === payload.conversationId
            ? {
                ...c,
                last_message: payload.message.content,
                updated_at: payload.message.created_at,
                unread_count: c.id !== selectedId ? c.unread_count + 1 : c.unread_count,
              }
            : c,
        ).sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()),
      );
    };

    on('message:new', handleNewMessage);
    return () => off('message:new', handleNewMessage);
  }, [on, off, selectedId]);

  const filtered = conversations.filter(
    (c) =>
      c.customer.name.toLowerCase().includes(search.toLowerCase()) ||
      c.customer.phone.includes(search),
  );

  return (
    <div className="flex flex-col h-full bg-[#111827] border-r border-white/5">
      {/* Header */}
      <div className="p-4 border-b border-white/5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-white">Inbox</h2>
          <button className="p-2 rounded-lg hover:bg-white/10 text-gray-400 hover:text-white transition-colors">
            <Filter className="w-4 h-4" />
          </button>
        </div>
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <input
            type="text"
            placeholder="Cari nama atau nomor..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500/50 focus:bg-white/10 transition-all"
          />
        </div>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto custom-scrollbar">
        {isLoading ? (
          <div className="p-4 space-y-3">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="flex gap-3 animate-pulse">
                <div className="w-10 h-10 rounded-full bg-white/10 flex-shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="h-3 bg-white/10 rounded w-3/4" />
                  <div className="h-2 bg-white/5 rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center p-6">
            <MessageSquare className="w-10 h-10 text-gray-600 mb-3" />
            <p className="text-gray-500 text-sm">Belum ada percakapan</p>
          </div>
        ) : (
          filtered.map((conv) => (
            <button
              key={conv.id}
              onClick={() => onSelect(conv)}
              className={cn(
                'w-full flex items-center gap-3 px-4 py-3 border-b border-white/5 hover:bg-white/5 transition-all text-left',
                selectedId === conv.id && 'bg-emerald-500/10 border-l-2 border-l-emerald-500',
              )}
            >
              {/* Avatar */}
              <div className="relative flex-shrink-0">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-white font-semibold text-sm">
                  {conv.customer.name.charAt(0).toUpperCase()}
                </div>
                <span
                  className={cn(
                    'absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-[#111827]',
                    statusColors[conv.customer.status] || 'bg-gray-400',
                  )}
                />
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-sm font-medium text-white truncate">
                    {conv.customer.name}
                  </span>
                  <span className="text-xs text-gray-500 flex-shrink-0 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {formatDistanceToNow(new Date(conv.updated_at), {
                      addSuffix: false,
                      locale: id,
                    })}
                  </span>
                </div>
                <div className="flex items-center justify-between gap-2 mt-0.5">
                  <p className="text-xs text-gray-500 truncate">
                    {conv.last_message || 'Belum ada pesan'}
                  </p>
                  {conv.unread_count > 0 && (
                    <span className="flex-shrink-0 bg-emerald-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                      {conv.unread_count > 9 ? '9+' : conv.unread_count}
                    </span>
                  )}
                </div>
              </div>
            </button>
          ))
        )}
      </div>
    </div>
  );
}
