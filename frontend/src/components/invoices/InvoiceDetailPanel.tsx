'use client';

import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import {
  X,
  FileText,
  Download,
  MessageSquare,
  CreditCard,
  Package,
  Phone,
  User,
  Calendar,
  CheckCircle,
  Loader2,
  ExternalLink,
  Send,
} from 'lucide-react';
import { api } from '@/services/api';
import { cn } from '@/lib/utils';
import { downloadInvoicePDF } from '@/lib/generateInvoicePDF';
import { Invoice, STATUS_CONFIGS } from './InvoiceRow';

interface Props {
  invoice: Invoice | null;
  onClose: () => void;
  onRefresh: () => void;
}

const PAYMENT_METHODS = [
  { value: 'CASH', label: 'Tunai', icon: '💵' },
  { value: 'TRANSFER', label: 'Transfer Bank', icon: '🏦' },
  { value: 'QRIS', label: 'QRIS', icon: '📱' },
  { value: 'EWALLET', label: 'E-Wallet', icon: '👛' },
];

export function InvoiceDetailPanel({ invoice, onClose, onRefresh }: Props) {
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('TRANSFER');
  const [paymentAmount, setPaymentAmount] = useState('');
  const [isDownloading, setIsDownloading] = useState(false);
  const queryClient = useQueryClient();

  const recordPayment = useMutation({
    mutationFn: (data: { method: string; amount: number }) =>
      api.post(`/invoices/${invoice!.id}/payments`, data).then((r) => r.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
      queryClient.invalidateQueries({ queryKey: ['invoice-stats'] });
      onRefresh();
      setShowPaymentForm(false);
      setPaymentAmount('');
    },
  });

  const sendAsInvoice = useMutation({
    mutationFn: () =>
      api.patch(`/invoices/${invoice!.id}/status`, { status: 'SENT' }).then((r) => r.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
      onRefresh();
    },
  });

  if (!invoice) {
    return (
      <div className="h-full bg-[#111827] border-l border-white/5 flex flex-col items-center justify-center p-6 text-center">
        <div className="p-4 rounded-2xl bg-purple-500/10 mb-4">
          <FileText className="w-8 h-8 text-purple-400" />
        </div>
        <p className="text-sm text-gray-500">Pilih invoice untuk melihat detail</p>
      </div>
    );
  }

  const statusConfig = STATUS_CONFIGS[invoice.status] || STATUS_CONFIGS.DRAFT;
  const StatusIcon = statusConfig.icon;
  const remaining = invoice.total - invoice.paid_amount;
  const progress = invoice.total > 0 ? (invoice.paid_amount / invoice.total) * 100 : 0;

  const handleDownloadPDF = async () => {
    setIsDownloading(true);
    try {
      await downloadInvoicePDF(invoice);
    } finally {
      setIsDownloading(false);
    }
  };

  const handleSendWhatsApp = async () => {
    // Get WA message from backend
    const res = await api.get(`/invoices/${invoice.id}/whatsapp`);
    const { waUrl } = res.data;
    window.open(waUrl, '_blank');
    // Mark as sent
    if (invoice.status === 'DRAFT') {
      sendAsInvoice.mutate();
    }
  };

  const handleRecordPayment = () => {
    const amount = parseFloat(paymentAmount.replace(/\./g, '').replace(',', '.'));
    if (!amount || amount <= 0) return;
    recordPayment.mutate({ method: paymentMethod, amount });
  };

  return (
    <div className="h-full bg-[#111827] border-l border-white/5 flex flex-col overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-white/5">
        <div>
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-purple-400" />
            <span className="text-sm font-mono font-bold text-purple-400">
              {invoice.invoice_number}
            </span>
            <span className={cn('text-[10px] font-semibold px-2 py-0.5 rounded-full border flex items-center gap-1', statusConfig.className)}>
              <StatusIcon className="w-2.5 h-2.5" />
              {statusConfig.label}
            </span>
          </div>
          <p className="text-xs text-gray-500 mt-0.5">
            {format(new Date(invoice.created_at), "d MMMM yyyy", { locale: id })}
          </p>
        </div>
        <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-lg transition-colors">
          <X className="w-4 h-4 text-gray-400" />
        </button>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto custom-scrollbar">
        {/* Customer */}
        <div className="px-5 py-4 border-b border-white/5">
          <h4 className="text-[10px] text-gray-500 uppercase tracking-wider font-semibold mb-3">Pelanggan</h4>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center text-white font-bold">
              {invoice.order.customer.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <p className="text-sm font-semibold text-white">{invoice.order.customer.name}</p>
              <p className="text-xs text-gray-500 flex items-center gap-1">
                <Phone className="w-3 h-3" />
                {invoice.order.customer.phone}
              </p>
            </div>
          </div>
        </div>

        {/* Payment Progress */}
        <div className="px-5 py-4 border-b border-white/5">
          <div className="flex justify-between items-baseline mb-2">
            <h4 className="text-[10px] text-gray-500 uppercase tracking-wider font-semibold">Pembayaran</h4>
            <span className="text-xs text-gray-500">{progress.toFixed(0)}%</span>
          </div>
          <div className="w-full bg-white/5 rounded-full h-2 mb-3 overflow-hidden">
            <div
              className={cn(
                'h-full rounded-full transition-all duration-700',
                progress >= 100 ? 'bg-emerald-500' : 'bg-yellow-500',
              )}
              style={{ width: `${Math.min(progress, 100)}%` }}
            />
          </div>
          <div className="flex justify-between text-xs">
            <div>
              <p className="text-gray-500">Total</p>
              <p className="font-bold text-white">Rp {invoice.total.toLocaleString('id-ID')}</p>
            </div>
            <div className="text-right">
              <p className="text-gray-500">Dibayar</p>
              <p className="font-bold text-emerald-400">Rp {invoice.paid_amount.toLocaleString('id-ID')}</p>
            </div>
            {remaining > 0 && (
              <div className="text-right">
                <p className="text-gray-500">Sisa</p>
                <p className="font-bold text-yellow-400">Rp {remaining.toLocaleString('id-ID')}</p>
              </div>
            )}
          </div>
        </div>

        {/* Due Date */}
        {invoice.due_date && (
          <div className="px-5 py-4 border-b border-white/5">
            <div className="flex items-center gap-2 text-sm">
              <Calendar className="w-4 h-4 text-gray-500" />
              <span className="text-gray-400">Jatuh tempo:</span>
              <span className="text-white font-medium">
                {format(new Date(invoice.due_date), 'd MMMM yyyy', { locale: id })}
              </span>
            </div>
          </div>
        )}

        {/* Order Items */}
        <div className="px-5 py-4 border-b border-white/5">
          <h4 className="text-[10px] text-gray-500 uppercase tracking-wider font-semibold mb-3">Item Pesanan</h4>
          <div className="space-y-2">
            {invoice.order.order_items.map((item) => (
              <div key={item.id} className="flex items-center justify-between py-1.5">
                <div className="flex items-center gap-2">
                  <Package className="w-3.5 h-3.5 text-gray-500" />
                  <div>
                    <p className="text-sm text-white">{item.name}</p>
                    <p className="text-[10px] text-gray-500">x{item.quantity} @ Rp {item.price.toLocaleString('id-ID')}</p>
                  </div>
                </div>
                <p className="text-sm font-semibold text-white">
                  Rp {(item.price * item.quantity).toLocaleString('id-ID')}
                </p>
              </div>
            ))}
          </div>

          {/* Totals summary */}
          <div className="mt-3 pt-3 border-t border-white/5 space-y-1">
            {invoice.order.discount > 0 && (
              <div className="flex justify-between text-xs">
                <span className="text-gray-500">Diskon</span>
                <span className="text-red-400">-Rp {invoice.order.discount.toLocaleString('id-ID')}</span>
              </div>
            )}
            {invoice.order.tax > 0 && (
              <div className="flex justify-between text-xs">
                <span className="text-gray-500">Pajak</span>
                <span className="text-gray-300">Rp {invoice.order.tax.toLocaleString('id-ID')}</span>
              </div>
            )}
            <div className="flex justify-between text-sm font-bold">
              <span className="text-white">Total</span>
              <span className="text-emerald-400">Rp {invoice.total.toLocaleString('id-ID')}</span>
            </div>
          </div>
        </div>

        {/* Payment History */}
        {invoice.payments.length > 0 && (
          <div className="px-5 py-4 border-b border-white/5">
            <h4 className="text-[10px] text-gray-500 uppercase tracking-wider font-semibold mb-3">Riwayat Pembayaran</h4>
            <div className="space-y-2">
              {invoice.payments.map((payment) => (
                <div key={payment.id} className="flex items-center justify-between py-2 bg-white/3 rounded-lg px-3">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                    <div>
                      <p className="text-xs font-medium text-white">{payment.method}</p>
                      <p className="text-[10px] text-gray-500">
                        {format(new Date(payment.created_at), 'd MMM yyyy HH:mm', { locale: id })}
                      </p>
                    </div>
                  </div>
                  <p className="text-sm font-bold text-emerald-400">
                    +Rp {payment.amount.toLocaleString('id-ID')}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Record Payment Form */}
        {showPaymentForm && !['PAID', 'CANCELLED'].includes(invoice.status) && (
          <div className="px-5 py-4 border-b border-white/5 bg-emerald-500/5">
            <h4 className="text-[10px] text-emerald-400 uppercase tracking-wider font-semibold mb-3">Catat Pembayaran</h4>
            
            {/* Method selector */}
            <div className="grid grid-cols-2 gap-2 mb-3">
              {PAYMENT_METHODS.map((m) => (
                <button
                  key={m.value}
                  onClick={() => setPaymentMethod(m.value)}
                  className={cn(
                    'flex items-center gap-2 px-3 py-2 rounded-lg border text-xs font-medium transition-all',
                    paymentMethod === m.value
                      ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-400'
                      : 'bg-white/5 border-white/10 text-gray-400 hover:border-white/20',
                  )}
                >
                  <span>{m.icon}</span>
                  {m.label}
                </button>
              ))}
            </div>

            {/* Amount input */}
            <div className="relative mb-3">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">Rp</span>
              <input
                type="number"
                value={paymentAmount}
                onChange={(e) => setPaymentAmount(e.target.value)}
                placeholder={remaining.toLocaleString('id-ID')}
                className="w-full pl-10 pr-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-sm text-white placeholder-gray-600 focus:outline-none focus:border-emerald-500/50"
              />
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => setShowPaymentForm(false)}
                className="flex-1 py-2 rounded-lg bg-white/5 border border-white/10 text-gray-400 text-sm"
              >
                Batal
              </button>
              <button
                onClick={handleRecordPayment}
                disabled={recordPayment.isPending}
                className="flex-1 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-white font-semibold text-sm transition-colors flex items-center justify-center gap-2"
              >
                {recordPayment.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
                Simpan
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Action Footer */}
      <div className="px-5 py-4 border-t border-white/5 bg-[#0d1117] space-y-2">
        {/* Record payment toggle */}
        {!['PAID', 'CANCELLED'].includes(invoice.status) && (
          <button
            onClick={() => setShowPaymentForm((v) => !v)}
            className="w-full flex items-center justify-center gap-2 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-white font-semibold text-sm rounded-xl transition-all shadow-lg shadow-emerald-500/20"
          >
            <CreditCard className="w-4 h-4" />
            Catat Pembayaran
          </button>
        )}

        <div className="flex gap-2">
          {/* Download PDF */}
          <button
            onClick={handleDownloadPDF}
            disabled={isDownloading}
            className="flex-1 flex items-center justify-center gap-2 py-2 rounded-xl bg-purple-500/10 hover:bg-purple-500/20 text-purple-400 border border-purple-500/20 text-sm transition-colors"
          >
            {isDownloading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Download className="w-3.5 h-3.5" />}
            PDF
          </button>

          {/* Send via WhatsApp */}
          <button
            onClick={handleSendWhatsApp}
            className="flex-1 flex items-center justify-center gap-2 py-2 rounded-xl bg-green-500/10 hover:bg-green-500/20 text-green-400 border border-green-500/20 text-sm transition-colors"
          >
            <MessageSquare className="w-3.5 h-3.5" />
            WhatsApp
            <ExternalLink className="w-2.5 h-2.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
