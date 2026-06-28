'use client';

import { useState, useEffect } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  X, Plus, Trash2, ShoppingBag, Search, Loader2, Package,
  ChevronDown, CheckCircle,
} from 'lucide-react';
import { api } from '@/services/api';
import { cn } from '@/lib/utils';

interface OrderItem {
  name: string;
  quantity: number;
  price: number;
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
  defaultStatus?: string;
}

export function CreateOrderModal({ isOpen, onClose, defaultStatus = 'PENDING' }: Props) {
  const queryClient = useQueryClient();

  const [customerId, setCustomerId] = useState('');
  const [customerSearch, setCustomerSearch] = useState('');
  const [showCustomerDropdown, setShowCustomerDropdown] = useState(false);
  const [items, setItems] = useState<OrderItem[]>([{ name: '', quantity: 1, price: 0 }]);
  const [discount, setDiscount] = useState(0);
  const [tax, setTax] = useState(0);
  const [notes, setNotes] = useState('');
  const [error, setError] = useState('');

  // Fetch customers for dropdown
  const { data: customersData } = useQuery({
    queryKey: ['customers-search', customerSearch],
    queryFn: () =>
      api.get('/crm/customers', {
        params: { search: customerSearch || undefined, limit: 10 },
      }).then((r) => r.data),
    enabled: showCustomerDropdown,
  });

  const customers = customersData?.customers || [];
  const selectedCustomer = customers.find((c: any) => c.id === customerId)
    || (customerId ? { id: customerId, name: customerSearch } : null);

  // Calculate totals
  const subtotal = items.reduce((sum, item) => sum + item.quantity * item.price, 0);
  const discountAmt = discount;
  const taxAmt = Math.round(((subtotal - discountAmt) * tax) / 100);
  const total = subtotal - discountAmt + taxAmt;

  const createMutation = useMutation({
    mutationFn: (data: any) => api.post('/orders', data).then((r) => r.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders-kanban'] });
      queryClient.invalidateQueries({ queryKey: ['orders-stats'] });
      handleClose();
    },
    onError: (err: any) => {
      setError(err.response?.data?.message || 'Gagal membuat pesanan.');
    },
  });

  const handleClose = () => {
    setCustomerId('');
    setCustomerSearch('');
    setItems([{ name: '', quantity: 1, price: 0 }]);
    setDiscount(0);
    setTax(0);
    setNotes('');
    setError('');
    onClose();
  };

  const addItem = () => {
    setItems((prev) => [...prev, { name: '', quantity: 1, price: 0 }]);
  };

  const removeItem = (index: number) => {
    if (items.length === 1) return;
    setItems((prev) => prev.filter((_, i) => i !== index));
  };

  const updateItem = (index: number, field: keyof OrderItem, value: string | number) => {
    setItems((prev) =>
      prev.map((item, i) =>
        i === index ? { ...item, [field]: field === 'name' ? value : Number(value) } : item,
      ),
    );
  };

  const isValid =
    customerId &&
    items.length > 0 &&
    items.every((item) => item.name.trim() && item.quantity > 0 && item.price >= 0);

  const handleSubmit = () => {
    if (!isValid) return;
    setError('');
    createMutation.mutate({
      customer_id: customerId,
      items,
      discount: discountAmt,
      tax,
      notes: notes.trim() || undefined,
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={handleClose}
      />

      {/* Modal */}
      <div className="relative z-10 w-full max-w-2xl max-h-[90vh] flex flex-col bg-[#0d1117] border border-white/10 rounded-2xl shadow-2xl shadow-black/50 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/5 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-emerald-500/15">
              <ShoppingBag className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Pesanan Baru</h2>
              <p className="text-xs text-gray-500">Buat pesanan untuk pelanggan</p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="p-2 hover:bg-white/10 rounded-lg text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">

          {/* Customer Selector */}
          <div>
            <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 block">
              Pelanggan *
            </label>
            <div className="relative">
              <div
                className={cn(
                  'flex items-center gap-2 px-4 py-3 rounded-xl border cursor-pointer transition-colors',
                  customerId
                    ? 'bg-emerald-500/10 border-emerald-500/30'
                    : 'bg-white/5 border-white/10 hover:border-white/20',
                )}
                onClick={() => setShowCustomerDropdown(true)}
              >
                <Search className="w-4 h-4 text-gray-500 flex-shrink-0" />
                {customerId ? (
                  <div className="flex-1 flex items-center gap-2">
                    <span className="text-sm text-white font-medium">
                      {selectedCustomer?.name || customerSearch}
                    </span>
                    <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                  </div>
                ) : (
                  <input
                    type="text"
                    placeholder="Cari nama atau nomor HP pelanggan..."
                    value={customerSearch}
                    onChange={(e) => {
                      setCustomerSearch(e.target.value);
                      setCustomerId('');
                      setShowCustomerDropdown(true);
                    }}
                    onClick={(e) => { e.stopPropagation(); setShowCustomerDropdown(true); }}
                    className="flex-1 bg-transparent text-sm text-white placeholder-gray-600 outline-none"
                  />
                )}
                {customerId && (
                  <button
                    onClick={(e) => { e.stopPropagation(); setCustomerId(''); setCustomerSearch(''); }}
                    className="p-0.5 hover:text-red-400 text-gray-600 transition-colors"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Dropdown */}
              {showCustomerDropdown && !customerId && (
                <>
                  <div
                    className="fixed inset-0 z-10"
                    onClick={() => setShowCustomerDropdown(false)}
                  />
                  <div className="absolute z-20 top-full mt-1 left-0 right-0 bg-[#111827] border border-white/10 rounded-xl shadow-2xl overflow-hidden">
                    {customers.length === 0 ? (
                      <div className="px-4 py-6 text-center text-sm text-gray-500">
                        {customerSearch ? 'Pelanggan tidak ditemukan' : 'Ketik untuk mencari pelanggan...'}
                      </div>
                    ) : (
                      customers.map((c: any) => (
                        <button
                          key={c.id}
                          onClick={() => {
                            setCustomerId(c.id);
                            setCustomerSearch(c.name);
                            setShowCustomerDropdown(false);
                          }}
                          className="w-full flex items-center gap-3 px-4 py-3 hover:bg-white/5 text-left transition-colors"
                        >
                          <div className="w-8 h-8 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 text-xs font-bold flex-shrink-0">
                            {c.name[0]}
                          </div>
                          <div>
                            <p className="text-sm font-medium text-white">{c.name}</p>
                            <p className="text-xs text-gray-500">{c.phone}</p>
                          </div>
                        </button>
                      ))
                    )}
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Items */}
          <div>
            <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 block">
              Item Pesanan *
            </label>
            <div className="space-y-2">
              {/* Table header */}
              <div className="grid grid-cols-12 gap-2 px-1">
                <span className="col-span-6 text-[10px] text-gray-500 uppercase tracking-wider">Nama Produk/Layanan</span>
                <span className="col-span-2 text-[10px] text-gray-500 uppercase tracking-wider text-center">Qty</span>
                <span className="col-span-3 text-[10px] text-gray-500 uppercase tracking-wider text-right">Harga Satuan</span>
                <span className="col-span-1" />
              </div>

              {items.map((item, idx) => (
                <div key={idx} className="grid grid-cols-12 gap-2 items-center">
                  <input
                    type="text"
                    placeholder="Nama layanan..."
                    value={item.name}
                    onChange={(e) => updateItem(idx, 'name', e.target.value)}
                    className="col-span-6 px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white placeholder-gray-600 focus:outline-none focus:border-emerald-500/50"
                  />
                  <input
                    type="number"
                    min={1}
                    value={item.quantity}
                    onChange={(e) => updateItem(idx, 'quantity', e.target.value)}
                    className="col-span-2 px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white text-center focus:outline-none focus:border-emerald-500/50"
                  />
                  <input
                    type="number"
                    min={0}
                    placeholder="0"
                    value={item.price || ''}
                    onChange={(e) => updateItem(idx, 'price', e.target.value)}
                    className="col-span-3 px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white text-right focus:outline-none focus:border-emerald-500/50"
                  />
                  <button
                    onClick={() => removeItem(idx)}
                    disabled={items.length === 1}
                    className="col-span-1 flex items-center justify-center p-2 rounded-lg text-gray-600 hover:text-red-400 hover:bg-red-500/10 transition-colors disabled:opacity-20 disabled:pointer-events-none"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}

              <button
                onClick={addItem}
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg border border-dashed border-white/10 text-gray-500 hover:text-gray-300 hover:border-white/25 text-xs transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                Tambah Item
              </button>
            </div>
          </div>

          {/* Discount & Tax */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 block">
                Diskon (Rp)
              </label>
              <input
                type="number"
                min={0}
                value={discount || ''}
                onChange={(e) => setDiscount(Number(e.target.value))}
                placeholder="0"
                className="w-full px-3 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm text-white placeholder-gray-600 focus:outline-none focus:border-emerald-500/50"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 block">
                Pajak (%)
              </label>
              <input
                type="number"
                min={0}
                max={100}
                value={tax || ''}
                onChange={(e) => setTax(Number(e.target.value))}
                placeholder="0"
                className="w-full px-3 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm text-white placeholder-gray-600 focus:outline-none focus:border-emerald-500/50"
              />
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 block">
              Catatan (opsional)
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Catatan tambahan untuk pesanan ini..."
              rows={2}
              className="w-full px-3 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm text-white placeholder-gray-600 focus:outline-none focus:border-emerald-500/50 resize-none"
            />
          </div>

          {/* Order Summary */}
          <div className="bg-white/3 border border-white/8 rounded-xl p-4 space-y-2">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Ringkasan Pesanan</p>
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">Subtotal</span>
              <span className="text-white">Rp {subtotal.toLocaleString('id-ID')}</span>
            </div>
            {discount > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Diskon</span>
                <span className="text-red-400">- Rp {discount.toLocaleString('id-ID')}</span>
              </div>
            )}
            {tax > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Pajak ({tax}%)</span>
                <span className="text-yellow-400">+ Rp {taxAmt.toLocaleString('id-ID')}</span>
              </div>
            )}
            <div className="pt-2 border-t border-white/10 flex justify-between">
              <span className="text-sm font-bold text-white">Total</span>
              <span className="text-base font-bold text-emerald-400">
                Rp {total.toLocaleString('id-ID')}
              </span>
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className="px-4 py-3 bg-red-500/10 border border-red-500/20 rounded-xl text-sm text-red-400">
              {error}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-white/5 flex gap-3 flex-shrink-0 bg-[#0d1117]">
          <button
            onClick={handleClose}
            className="flex-1 py-2.5 rounded-xl bg-white/5 border border-white/10 text-gray-400 text-sm hover:text-white transition-colors"
          >
            Batal
          </button>
          <button
            onClick={handleSubmit}
            disabled={!isValid || createMutation.isPending}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 disabled:opacity-30 disabled:cursor-not-allowed text-white font-semibold text-sm transition-all shadow-lg shadow-emerald-500/20"
          >
            {createMutation.isPending ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <ShoppingBag className="w-4 h-4" />
            )}
            Buat Pesanan
          </button>
        </div>
      </div>
    </div>
  );
}
