'use client';

import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import {
  FileText,
  CheckCircle,
  Clock,
  AlertTriangle,
  XCircle,
  CreditCard,
  Minus,
} from 'lucide-react';
import { cn } from '@/lib/utils';

export interface Invoice {
  id: string;
  invoice_number: string;
  status: string;
  total: number;
  paid_amount: number;
  due_date: string | null;
  created_at: string;
  order: {
    id: string;
    order_number: string;
    customer: { id: string; name: string; phone: string };
    order_items: { id: string; name: string; quantity: number; price: number }[];
    subtotal: number;
    discount: number;
    tax: number;
    total: number;
  };
  payments: {
    id: string;
    method: string;
    amount: number;
    created_at: string;
  }[];
}

interface StatusConfig {
  label: string;
  icon: any;
  className: string;
}

export const STATUS_CONFIGS: Record<string, StatusConfig> = {
  DRAFT: {
    label: 'Draft',
    icon: Minus,
    className: 'bg-gray-500/10 text-gray-400 border-gray-500/20',
  },
  SENT: {
    label: 'Terkirim',
    icon: FileText,
    className: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  },
  PARTIALLY_PAID: {
    label: 'Bayar Sebagian',
    icon: Clock,
    className: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
  },
  PAID: {
    label: 'Lunas',
    icon: CheckCircle,
    className: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  },
  OVERDUE: {
    label: 'Jatuh Tempo',
    icon: AlertTriangle,
    className: 'bg-red-500/10 text-red-400 border-red-500/20',
  },
  CANCELLED: {
    label: 'Dibatalkan',
    icon: XCircle,
    className: 'bg-gray-500/10 text-gray-500 border-gray-500/20',
  },
};

interface Props {
  invoice: Invoice;
  onSelect: (invoice: Invoice) => void;
  isSelected: boolean;
}

export function InvoiceRow({ invoice, onSelect, isSelected }: Props) {
  const statusConfig = STATUS_CONFIGS[invoice.status] || STATUS_CONFIGS.DRAFT;
  const StatusIcon = statusConfig.icon;
  const remaining = invoice.total - invoice.paid_amount;
  const isOverdue =
    invoice.due_date &&
    new Date(invoice.due_date) < new Date() &&
    !['PAID', 'CANCELLED'].includes(invoice.status);

  return (
    <tr
      onClick={() => onSelect(invoice)}
      className={cn(
        'border-b border-white/5 hover:bg-white/3 cursor-pointer transition-all group',
        isSelected && 'bg-emerald-500/5 border-l-2 border-l-emerald-500',
      )}
    >
      {/* Invoice Number */}
      <td className="px-5 py-4">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-purple-500/10">
            <FileText className="w-3.5 h-3.5 text-purple-400" />
          </div>
          <div>
            <p className="text-sm font-mono font-semibold text-white">
              {invoice.invoice_number}
            </p>
            <p className="text-[10px] text-gray-500">
              #{invoice.order.order_number}
            </p>
          </div>
        </div>
      </td>

      {/* Customer */}
      <td className="px-5 py-4">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
            {invoice.order.customer.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <p className="text-sm text-white">{invoice.order.customer.name}</p>
            <p className="text-[10px] text-gray-500">{invoice.order.customer.phone}</p>
          </div>
        </div>
      </td>

      {/* Amount */}
      <td className="px-5 py-4">
        <p className="text-sm font-bold text-white">
          Rp {invoice.total.toLocaleString('id-ID')}
        </p>
        {invoice.paid_amount > 0 && invoice.status !== 'PAID' && (
          <p className="text-[10px] text-yellow-400">
            Sisa: Rp {remaining.toLocaleString('id-ID')}
          </p>
        )}
      </td>

      {/* Due Date */}
      <td className="px-5 py-4">
        {invoice.due_date ? (
          <div>
            <p className={cn('text-sm', isOverdue ? 'text-red-400' : 'text-gray-300')}>
              {format(new Date(invoice.due_date), 'd MMM yyyy', { locale: id })}
            </p>
            {isOverdue && (
              <p className="text-[10px] text-red-400 flex items-center gap-1">
                <AlertTriangle className="w-2.5 h-2.5" />
                Jatuh tempo!
              </p>
            )}
          </div>
        ) : (
          <span className="text-gray-600 text-sm">—</span>
        )}
      </td>

      {/* Status */}
      <td className="px-5 py-4">
        <div
          className={cn(
            'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-xs font-semibold',
            statusConfig.className,
          )}
        >
          <StatusIcon className="w-3 h-3" />
          {statusConfig.label}
        </div>
      </td>

      {/* Created */}
      <td className="px-5 py-4">
        <p className="text-xs text-gray-500">
          {format(new Date(invoice.created_at), 'd MMM yyyy', { locale: id })}
        </p>
      </td>
    </tr>
  );
}
