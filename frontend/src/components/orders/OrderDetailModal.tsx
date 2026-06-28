'use client';

import { useState, Fragment } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  X,
  ShoppingBag,
  User,
  Phone,
  Package,
  CreditCard,
  Tag,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Loader2,
  Trash2,
  ChevronRight,
  FileText,
} from 'lucide-react';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import { api } from '@/services/api';
import { cn } from '@/lib/utils';
import type { Order } from './KanbanCard';

interface Props {
  order: Order | null;
  onClose: () => void;
  onStatusChange: (orderId: string, status: string) => Promise<void>;
}

const STATUS_FLOW: Record<string, { next: string; label: string; icon: any; color: string }> = {
  DRAFT: { next: 'PENDING', label: 'Konfirmasi Pesanan', icon: CheckCircle, color: 'bg-yellow-500 hover:bg-yellow-400' },
  PENDING: { next: 'PROCESSING', label: 'Mulai Proses', icon: AlertCircle, color: 'bg-blue-500 hover:bg-blue-400' },
  PROCESSING: { next: 'COMPLETED', label: 'Tandai Selesai', icon: CheckCircle, color: 'bg-emerald-500 hover:bg-emerald-400' },
  COMPLETED: { next: '', label: 'Selesai', icon: CheckCircle, color: '' },
};

const statusBadgeColors: Record<string, string> = {
  DRAFT: 'bg-gray-500/10 text-gray-400 border-gray-500/20',
  PENDING: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
  PROCESSING: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  COMPLETED: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  CANCELLED: 'bg-red-500/10 text-red-400 border-red-500/20',
};

export function OrderDetailModal({ order, onClose, onStatusChange }: Props) {
  const [isUpdating, setIsUpdating] = useState(false);
  const queryClient = useQueryClient();

  if (!order) return null;

  const { data: detail } = useQuery({
    queryKey: ['order-detail', order.id],
    queryFn: () => api.get(`/orders/${order.id}`).then((r) => r.data),
    enabled: !!order.id,
    initialData: order,
  });

  const currentOrder: Order = detail || order;
  const flow = STATUS_FLOW[currentOrder.status];

  const handleAdvanceStatus = async () => {
    if (!flow?.next) return;
    setIsUpdating(true);
    try {
      await onStatusChange(currentOrder.id, flow.next);
      queryClient.invalidateQueries({ queryKey: ['order-detail', currentOrder.id] });
    } finally {
      setIsUpdating(false);
    }
  };

  const handleCancel = async () => {
    if (!confirm('Yakin ingin membatalkan pesanan ini?')) return;
    setIsUpdating(true);
    try {
      await onStatusChange(currentOrder.id, 'CANCELLED');
      onClose();
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed right-0 top-0 h-full w-full max-w-md bg-[#111827] border-l border-white/5 z-50 flex flex-col shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/5">
          <div>
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-4 h-4 text-emerald-400" />
              <span className="text-sm font-mono font-bold text-emerald-400">
                #{currentOrder.order_number}
              </span>
              <span className={cn('text-[10px] font-semibold px-2 py-0.5 rounded-full border uppercase', statusBadgeColors[currentOrder.status])}>
                {currentOrder.status}
              </span>
            </div>
            <p className="text-xs text-gray-500 mt-0.5">
              {format(new Date(currentOrder.created_at), "d MMMM yyyy 'pukul' HH:mm", { locale: id })}
            </p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-lg transition-colors">
            <X className="w-4 h-4 text-gray-400" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto custom-scrollbar">
          {/* Customer */}
          <div className="px-5 py-4 border-b border-white/5">
            <h3 className="text-[10px] text-gray-500 uppercase tracking-wider font-semibold mb-3">
              Pelanggan
            </h3>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center text-white font-bold">
                {currentOrder.customer.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <p className="text-sm font-semibold text-white">{currentOrder.customer.name}</p>
                <p className="text-xs text-gray-500 flex items-center gap-1">
                  <Phone className="w-3 h-3" />
                  {currentOrder.customer.phone}
                </p>
              </div>
            </div>
          </div>

          {/* Order Items */}
          <div className="px-5 py-4 border-b border-white/5">
            <h3 className="text-[10px] text-gray-500 uppercase tracking-wider font-semibold mb-3">
              Item Pesanan
            </h3>
            <div className="space-y-2">
              {currentOrder.order_items.map((item) => (
                <div key={item.id} className="flex items-center justify-between py-2 border-b border-white/5 last:border-0">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 bg-white/5 rounded-lg">
                      <Package className="w-3.5 h-3.5 text-gray-400" />
                    </div>
                    <div>
                      <p className="text-sm text-white">{item.name}</p>
                      <p className="text-[10px] text-gray-500">x{item.quantity} unit</p>
                    </div>
                  </div>
                  <p className="text-sm font-semibold text-white">
                    Rp {(item.price * item.quantity).toLocaleString('id-ID')}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Pricing */}
          <div className="px-5 py-4 border-b border-white/5">
            <h3 className="text-[10px] text-gray-500 uppercase tracking-wider font-semibold mb-3">
              Rincian Harga
            </h3>
            <div className="space-y-1.5">
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Subtotal</span>
                <span className="text-white">Rp {currentOrder.subtotal.toLocaleString('id-ID')}</span>
              </div>
              {currentOrder.discount > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Diskon</span>
                  <span className="text-red-400">-Rp {currentOrder.discount.toLocaleString('id-ID')}</span>
                </div>
              )}
              {currentOrder.tax > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Pajak</span>
                  <span className="text-white">Rp {currentOrder.tax.toLocaleString('id-ID')}</span>
                </div>
              )}
              <div className="flex justify-between text-sm font-bold pt-2 border-t border-white/5">
                <span className="text-white">Total</span>
                <span className="text-emerald-400 text-base">Rp {currentOrder.total.toLocaleString('id-ID')}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Action Footer */}
        <div className="px-5 py-4 border-t border-white/5 bg-[#0d1117] space-y-2">
          {/* Advance status button */}
          {flow?.next && (
            <button
              onClick={handleAdvanceStatus}
              disabled={isUpdating}
              className={cn(
                'w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-white font-semibold text-sm transition-all shadow-lg',
                flow.color,
                isUpdating && 'opacity-60 cursor-not-allowed',
              )}
            >
              {isUpdating ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <flow.icon className="w-4 h-4" />
              )}
              {flow.label}
              {!isUpdating && <ChevronRight className="w-4 h-4 ml-auto" />}
            </button>
          )}

          <div className="flex gap-2">
            <button
              onClick={() => {}} // Future: create invoice
              className="flex-1 flex items-center justify-center gap-2 py-2 rounded-xl bg-purple-500/10 hover:bg-purple-500/20 text-purple-400 border border-purple-500/20 text-sm transition-colors"
            >
              <FileText className="w-3.5 h-3.5" />
              Buat Invoice
            </button>
            {!['COMPLETED', 'CANCELLED'].includes(currentOrder.status) && (
              <button
                onClick={handleCancel}
                disabled={isUpdating}
                className="flex-1 flex items-center justify-center gap-2 py-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 text-sm transition-colors"
              >
                <XCircle className="w-3.5 h-3.5" />
                Batalkan
              </button>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
