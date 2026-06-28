'use client';

import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { formatDistanceToNow } from 'date-fns';
import { id } from 'date-fns/locale';
import {
  User,
  Package,
  CreditCard,
  MoreVertical,
  GripVertical,
  FileText,
  ArrowRight,
} from 'lucide-react';
import { cn } from '@/lib/utils';

export interface Order {
  id: string;
  order_number: string;
  status: string;
  subtotal: number;
  discount: number;
  tax: number;
  total: number;
  created_at: string;
  updated_at: string;
  customer: { id: string; name: string; phone: string };
  order_items: { id: string; name: string; quantity: number; price: number }[];
  _count?: { invoices: number };
}

interface Props {
  order: Order;
  onViewDetail: (order: Order) => void;
}

const statusColors: Record<string, string> = {
  DRAFT: 'text-gray-400 bg-gray-500/10 border-gray-500/20',
  PENDING: 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20',
  CONFIRMED: 'text-blue-400 bg-blue-500/10 border-blue-500/20',
  PROCESSING: 'text-blue-400 bg-blue-500/10 border-blue-500/20',
  COMPLETED: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
  CANCELLED: 'text-red-400 bg-red-500/10 border-red-500/20',
};

export function KanbanCard({ order, onViewDetail }: Props) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: order.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
    zIndex: isDragging ? 999 : 'auto',
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        'bg-[#1a2234] border border-white/5 rounded-xl p-4 group cursor-default select-none',
        'hover:border-white/15 hover:shadow-lg hover:shadow-black/20 transition-all duration-200',
        isDragging && 'shadow-2xl shadow-black/40 ring-1 ring-emerald-500/30',
      )}
    >
      {/* Card Header */}
      <div className="flex items-start justify-between gap-2 mb-3">
        <div className="flex items-center gap-2 min-w-0">
          {/* Drag handle */}
          <div
            {...attributes}
            {...listeners}
            className="flex-shrink-0 p-1 rounded-md hover:bg-white/10 text-gray-600 hover:text-gray-400 cursor-grab active:cursor-grabbing transition-colors"
          >
            <GripVertical className="w-3.5 h-3.5" />
          </div>
          <span className="text-xs font-mono font-semibold text-emerald-400 truncate">
            #{order.order_number}
          </span>
        </div>
        <button
          onClick={() => onViewDetail(order)}
          className="flex-shrink-0 p-1.5 rounded-md hover:bg-white/10 text-gray-500 hover:text-white transition-colors opacity-0 group-hover:opacity-100"
        >
          <MoreVertical className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Customer */}
      <div className="flex items-center gap-2 mb-3">
        <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
          {order.customer.name.charAt(0).toUpperCase()}
        </div>
        <div className="min-w-0">
          <p className="text-sm font-medium text-white truncate">{order.customer.name}</p>
          <p className="text-[10px] text-gray-500">{order.customer.phone}</p>
        </div>
      </div>

      {/* Items summary */}
      <div className="flex items-center gap-1.5 mb-3">
        <Package className="w-3.5 h-3.5 text-gray-500 flex-shrink-0" />
        <p className="text-xs text-gray-400 truncate">
          {order.order_items.length > 0
            ? order.order_items
                .slice(0, 2)
                .map((i) => `${i.name} x${i.quantity}`)
                .join(', ') + (order.order_items.length > 2 ? ` +${order.order_items.length - 2} lagi` : '')
            : 'Tidak ada item'}
        </p>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between pt-2.5 border-t border-white/5">
        <div>
          <p className="text-sm font-bold text-white">
            Rp {order.total.toLocaleString('id-ID')}
          </p>
          <p className="text-[10px] text-gray-500">
            {formatDistanceToNow(new Date(order.created_at), { addSuffix: true, locale: id })}
          </p>
        </div>
        <div className="flex items-center gap-1">
          {(order._count?.invoices ?? 0) > 0 && (
            <div className="p-1.5 rounded-md bg-purple-500/10 text-purple-400" title="Ada invoice">
              <FileText className="w-3 h-3" />
            </div>
          )}
          <button
            onClick={() => onViewDetail(order)}
            className="p-1.5 rounded-md bg-white/5 hover:bg-emerald-500/15 text-gray-400 hover:text-emerald-400 transition-colors"
            title="Lihat detail"
          >
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>
      </div>
    </div>
  );
}
