'use client';

import { useState } from 'react';
import { MessageSquare, Wifi, WifiOff } from 'lucide-react';
import { ConversationList } from '@/components/inbox/ConversationList';
import { ChatArea } from '@/components/inbox/ChatArea';
import { CustomerContextPanel } from '@/components/inbox/CustomerContextPanel';
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

export default function InboxPage() {
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const { isConnected } = useSocket();

  return (
    <div className="h-full flex flex-col overflow-hidden">
      {/* Page Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-white/5 bg-[#111827] flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-emerald-500/15">
            <MessageSquare className="w-5 h-5 text-emerald-400" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-white">WhatsApp Inbox</h1>
            <p className="text-xs text-gray-500">Kelola semua percakapan pelanggan</p>
          </div>
        </div>

        {/* Connection Status */}
        <div
          className={cn(
            'flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-medium',
            isConnected
              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
              : 'bg-red-500/10 border-red-500/30 text-red-400',
          )}
        >
          {isConnected ? (
            <>
              <Wifi className="w-3.5 h-3.5" />
              Real-time Aktif
            </>
          ) : (
            <>
              <WifiOff className="w-3.5 h-3.5" />
              Menghubungkan...
            </>
          )}
        </div>
      </div>

      {/* 3-Column Layout */}
      <div className="flex-1 flex overflow-hidden">
        {/* Column 1: Conversation List (fixed width) */}
        <div className="w-[300px] xl:w-[320px] flex-shrink-0 overflow-hidden">
          <ConversationList
            selectedId={selectedConversation?.id || null}
            onSelect={setSelectedConversation}
          />
        </div>

        {/* Column 2: Chat Area (grows) */}
        <div className="flex-1 min-w-0 overflow-hidden">
          {selectedConversation ? (
            <ChatArea
              conversationId={selectedConversation.id}
              customerName={selectedConversation.customer.name}
              customerPhone={selectedConversation.customer.phone}
            />
          ) : (
            <EmptyState />
          )}
        </div>

        {/* Column 3: Customer Context Panel (fixed width, hidden on medium screens) */}
        <div className="w-[280px] xl:w-[300px] flex-shrink-0 overflow-hidden hidden lg:block">
          {selectedConversation ? (
            <CustomerContextPanel conversationId={selectedConversation.id} />
          ) : (
            <div className="h-full bg-[#111827] border-l border-white/5 flex items-center justify-center">
              <p className="text-gray-600 text-sm text-center px-4">
                Pilih percakapan untuk melihat detail pelanggan
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="h-full flex flex-col items-center justify-center bg-[#0d1117] text-center px-8">
      <div className="relative mb-6">
        <div className="w-20 h-20 rounded-full bg-emerald-500/10 flex items-center justify-center">
          <MessageSquare className="w-10 h-10 text-emerald-500/50" />
        </div>
        <div className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-emerald-500 flex items-center justify-center">
          <span className="text-white text-xs font-bold">✓</span>
        </div>
      </div>
      <h3 className="text-lg font-semibold text-white mb-2">
        Pilih Percakapan
      </h3>
      <p className="text-sm text-gray-500 max-w-xs">
        Klik salah satu percakapan di sebelah kiri untuk mulai membalas pesan pelanggan secara real-time.
      </p>
      <div className="mt-6 flex items-center gap-2 text-xs text-emerald-400 bg-emerald-500/10 px-4 py-2 rounded-full border border-emerald-500/20">
        <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
        Sistem real-time aktif
      </div>
    </div>
  );
}
