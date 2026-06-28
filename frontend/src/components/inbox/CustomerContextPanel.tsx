'use client';

import { useQuery } from '@tanstack/react-query';
import { formatDistanceToNow } from 'date-fns';
import { id } from 'date-fns/locale';
import {
  Phone,
  Mail,
  MapPin,
  Tag,
  ShoppingBag,
  TrendingUp,
  ExternalLink,
  User,
  Star,
} from 'lucide-react';
import { api } from '@/services/api';
import { cn } from '@/lib/utils';

interface Props {
  conversationId: string;
}

const statusBadgeColors: Record<string, string> = {
  LEAD: 'bg-yellow-500/15 text-yellow-400 border-yellow-500/30',
  PROSPECT: 'bg-blue-500/15 text-blue-400 border-blue-500/30',
  CUSTOMER: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
  VIP: 'bg-purple-500/15 text-purple-400 border-purple-500/30',
  INACTIVE: 'bg-gray-500/15 text-gray-400 border-gray-500/30',
};

const orderStatusColors: Record<string, string> = {
  PENDING: 'text-yellow-400',
  PROCESSING: 'text-blue-400',
  COMPLETED: 'text-emerald-400',
  CANCELLED: 'text-red-400',
  DRAFT: 'text-gray-400',
};

function StatCard({ icon: Icon, label, value }: { icon: any; label: string; value: string }) {
  return (
    <div className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/5">
      <div className="p-2 rounded-lg bg-emerald-500/15">
        <Icon className="w-3.5 h-3.5 text-emerald-400" />
      </div>
      <div>
        <p className="text-[10px] text-gray-500 uppercase tracking-wide">{label}</p>
        <p className="text-sm font-semibold text-white">{value}</p>
      </div>
    </div>
  );
}

export function CustomerContextPanel({ conversationId }: Props) {
  const { data, isLoading } = useQuery({
    queryKey: ['conversation-detail', conversationId],
    queryFn: () =>
      api.get(`/messages/conversations/${conversationId}`).then((r) => r.data),
    enabled: !!conversationId,
  });

  if (isLoading) {
    return (
      <div className="h-full bg-[#111827] border-l border-white/5 p-4 animate-pulse space-y-4">
        <div className="flex flex-col items-center gap-3">
          <div className="w-16 h-16 rounded-full bg-white/10" />
          <div className="h-4 bg-white/10 rounded w-32" />
          <div className="h-3 bg-white/5 rounded w-24" />
        </div>
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-12 bg-white/5 rounded-xl" />
        ))}
      </div>
    );
  }

  if (!data?.customer) {
    return (
      <div className="h-full bg-[#111827] border-l border-white/5 flex items-center justify-center">
        <div className="text-center text-gray-600">
          <User className="w-8 h-8 mx-auto mb-2" />
          <p className="text-sm">Pilih percakapan</p>
        </div>
      </div>
    );
  }

  const { customer } = data;
  const tags: string[] = customer.tags?.map((t: any) => t.tag) || [];
  const orders: any[] = customer.orders || [];

  return (
    <div className="h-full bg-[#111827] border-l border-white/5 overflow-y-auto custom-scrollbar">
      {/* Profile Header */}
      <div className="p-5 border-b border-white/5 bg-gradient-to-b from-emerald-500/5 to-transparent">
        <div className="flex flex-col items-center text-center">
          <div className="relative">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-emerald-500/20">
              {customer.name.charAt(0).toUpperCase()}
            </div>
            {customer.status === 'VIP' && (
              <Star className="absolute -top-1 -right-1 w-4 h-4 text-yellow-400 fill-yellow-400" />
            )}
          </div>
          <h3 className="mt-3 text-base font-bold text-white">{customer.name}</h3>
          <span
            className={cn(
              'mt-1.5 text-[10px] font-semibold px-2.5 py-0.5 rounded-full border uppercase tracking-wider',
              statusBadgeColors[customer.status] || statusBadgeColors.LEAD,
            )}
          >
            {customer.status}
          </span>
        </div>

        {/* Quick Actions */}
        <div className="flex gap-2 mt-4">
          <a
            href={`https://wa.me/${customer.phone}`}
            target="_blank"
            rel="noreferrer"
            className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-400 rounded-lg text-xs font-medium transition-colors border border-emerald-500/20"
          >
            <Phone className="w-3.5 h-3.5" />
            WhatsApp
          </a>
          <a
            href={`/crm?customer=${customer.id}`}
            className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white rounded-lg text-xs font-medium transition-colors border border-white/10"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            Profil
          </a>
        </div>
      </div>

      {/* Contact Info */}
      <div className="p-4 border-b border-white/5 space-y-2">
        <h4 className="text-[10px] text-gray-500 uppercase tracking-wider font-semibold mb-3">
          Informasi Kontak
        </h4>
        <div className="flex items-center gap-2.5 text-sm text-gray-400">
          <Phone className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" />
          <span>{customer.phone}</span>
        </div>
        {customer.email && (
          <div className="flex items-center gap-2.5 text-sm text-gray-400">
            <Mail className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" />
            <span className="truncate">{customer.email}</span>
          </div>
        )}
        {customer.address && (
          <div className="flex items-start gap-2.5 text-sm text-gray-400">
            <MapPin className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0 mt-0.5" />
            <span className="line-clamp-2">{customer.address}</span>
          </div>
        )}
      </div>

      {/* Stats */}
      <div className="p-4 border-b border-white/5 space-y-2">
        <h4 className="text-[10px] text-gray-500 uppercase tracking-wider font-semibold mb-3">
          Ringkasan
        </h4>
        <StatCard
          icon={ShoppingBag}
          label="Total Pesanan"
          value={`${customer.total_orders} pesanan`}
        />
        <StatCard
          icon={TrendingUp}
          label="Total Belanja"
          value={`Rp ${(customer.total_spent || 0).toLocaleString('id-ID')}`}
        />
      </div>

      {/* Tags */}
      {tags.length > 0 && (
        <div className="p-4 border-b border-white/5">
          <h4 className="text-[10px] text-gray-500 uppercase tracking-wider font-semibold mb-3">
            Tags
          </h4>
          <div className="flex flex-wrap gap-1.5">
            {tags.map((tag) => (
              <span
                key={tag}
                className="flex items-center gap-1 px-2 py-0.5 bg-blue-500/10 text-blue-400 text-xs rounded-full border border-blue-500/20"
              >
                <Tag className="w-2.5 h-2.5" />
                {tag}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Recent Orders */}
      {orders.length > 0 && (
        <div className="p-4">
          <h4 className="text-[10px] text-gray-500 uppercase tracking-wider font-semibold mb-3">
            Pesanan Terakhir
          </h4>
          <div className="space-y-2">
            {orders.map((order) => (
              <div
                key={order.id}
                className="flex items-center justify-between p-2.5 rounded-lg bg-white/5 border border-white/5 hover:bg-white/10 transition-colors"
              >
                <div>
                  <p className="text-xs font-medium text-white">#{order.order_number}</p>
                  <p className="text-[10px] text-gray-500 mt-0.5">
                    {formatDistanceToNow(new Date(order.created_at), {
                      addSuffix: true,
                      locale: id,
                    })}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xs font-semibold text-white">
                    Rp {order.total.toLocaleString('id-ID')}
                  </p>
                  <p className={cn('text-[10px] font-medium', orderStatusColors[order.status])}>
                    {order.status}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
