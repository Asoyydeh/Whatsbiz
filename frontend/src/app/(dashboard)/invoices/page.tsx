'use client';

import { useState, useCallback } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import {
  FileText,
  Search,
  Filter,
  RefreshCw,
  TrendingUp,
  CheckCircle,
  AlertTriangle,
  Clock,
  DollarSign,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { api } from '@/services/api';
import { InvoiceRow, Invoice, STATUS_CONFIGS } from '@/components/invoices/InvoiceRow';
import { InvoiceDetailPanel } from '@/components/invoices/InvoiceDetailPanel';
import { cn } from '@/lib/utils';

const STATUS_FILTERS = [
  { value: '', label: 'Semua' },
  { value: 'DRAFT', label: 'Draft' },
  { value: 'SENT', label: 'Terkirim' },
  { value: 'PARTIALLY_PAID', label: 'Bayar Sebagian' },
  { value: 'PAID', label: 'Lunas' },
  { value: 'OVERDUE', label: 'Jatuh Tempo' },
];

function StatsCard({
  icon: Icon,
  label,
  value,
  sub,
  color,
}: {
  icon: any;
  label: string;
  value: string;
  sub?: string;
  color: string;
}) {
  return (
    <div className={cn('p-4 rounded-xl border bg-white/3', color)}>
      <div className="flex items-start justify-between mb-2">
        <Icon className="w-4 h-4" />
        <span className="text-[10px] text-gray-500 uppercase tracking-wider">{label}</span>
      </div>
      <p className="text-xl font-bold text-white">{value}</p>
      {sub && <p className="text-[10px] text-gray-500 mt-0.5">{sub}</p>}
    </div>
  );
}

export default function InvoicesPage() {
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [statusFilter, setStatusFilter] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const limit = 15;
  const queryClient = useQueryClient();

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['invoices', page, statusFilter, search],
    queryFn: () =>
      api
        .get('/invoices', {
          params: { page, limit, status: statusFilter || undefined, search: search || undefined },
        })
        .then((r) => r.data),
    keepPreviousData: true,
  } as any);

  const { data: stats } = useQuery({
    queryKey: ['invoice-stats'],
    queryFn: () => api.get('/invoices/stats').then((r) => r.data),
  });

  const invoices: Invoice[] = (data as any)?.invoices || [];
  const total: number = (data as any)?.total || 0;
  const totalPages = Math.ceil(total / limit);

  const handleRefresh = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ['invoices'] });
    queryClient.invalidateQueries({ queryKey: ['invoice-stats'] });
    // Update selected invoice if changed
    if (selectedInvoice) {
      api.get(`/invoices/${selectedInvoice.id}`).then((r) => setSelectedInvoice(r.data)).catch(() => {});
    }
  }, [queryClient, selectedInvoice]);

  return (
    <div className="h-full flex flex-col overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-white/5 bg-[#111827] flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-purple-500/15">
            <FileText className="w-5 h-5 text-purple-400" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-white">Invoices</h1>
            <p className="text-xs text-gray-500">Kelola tagihan & pembayaran pelanggan</p>
          </div>
        </div>
        <button
          onClick={() => refetch()}
          className="p-2 rounded-lg hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
          title="Refresh"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {/* Stats Row */}
      <div className="px-6 py-3 border-b border-white/5 bg-[#111827] flex-shrink-0">
        <div className="grid grid-cols-2 xl:grid-cols-4 gap-3">
          <StatsCard
            icon={FileText}
            label="Total Invoice"
            value={String(stats?.total || 0)}
            color="border-purple-500/20 text-purple-400"
          />
          <StatsCard
            icon={CheckCircle}
            label="Lunas"
            value={`${stats?.counts?.PAID?.count || 0}`}
            sub={`Rp ${((stats?.counts?.PAID?.sum || 0) / 1000000).toFixed(1)}jt`}
            color="border-emerald-500/20 text-emerald-400"
          />
          <StatsCard
            icon={Clock}
            label="Belum Lunas"
            value={`${(stats?.counts?.SENT?.count || 0) + (stats?.counts?.PARTIALLY_PAID?.count || 0)}`}
            color="border-yellow-500/20 text-yellow-400"
          />
          <StatsCard
            icon={AlertTriangle}
            label="Jatuh Tempo"
            value={String(stats?.overdueCount || 0)}
            color="border-red-500/20 text-red-400"
          />
        </div>
      </div>

      {/* Main Layout: Table + Detail */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left: Invoice Table */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Toolbar */}
          <div className="flex items-center gap-3 px-5 py-3 border-b border-white/5 bg-[#0d1117] flex-shrink-0">
            {/* Search */}
            <div className="relative flex-1 max-w-xs">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-500" />
              <input
                type="text"
                placeholder="Cari invoice atau pelanggan..."
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                className="w-full pl-9 pr-4 py-2 bg-white/5 border border-white/10 rounded-lg text-xs text-white placeholder-gray-600 focus:outline-none focus:border-purple-500/50"
              />
            </div>

            {/* Status filters */}
            <div className="flex items-center gap-1.5 overflow-x-auto">
              {STATUS_FILTERS.map((f) => (
                <button
                  key={f.value}
                  onClick={() => { setStatusFilter(f.value); setPage(1); }}
                  className={cn(
                    'flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-all border',
                    statusFilter === f.value
                      ? 'bg-purple-500/20 text-purple-400 border-purple-500/40'
                      : 'bg-white/3 text-gray-500 border-white/5 hover:border-white/15 hover:text-gray-300',
                  )}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          {/* Table */}
          <div className="flex-1 overflow-auto custom-scrollbar">
            <table className="w-full">
              <thead className="sticky top-0 bg-[#0d1117] z-10">
                <tr className="border-b border-white/5">
                  {['Invoice', 'Pelanggan', 'Total', 'Jatuh Tempo', 'Status', 'Dibuat'].map((h) => (
                    <th key={h} className="px-5 py-3 text-left text-[10px] text-gray-500 uppercase tracking-wider font-semibold">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  [...Array(8)].map((_, i) => (
                    <tr key={i} className="border-b border-white/5 animate-pulse">
                      {[...Array(6)].map((_, j) => (
                        <td key={j} className="px-5 py-4">
                          <div className="h-3 bg-white/5 rounded w-3/4" />
                        </td>
                      ))}
                    </tr>
                  ))
                ) : invoices.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-20">
                      <div className="flex flex-col items-center gap-3">
                        <div className="p-4 rounded-2xl bg-purple-500/10">
                          <FileText className="w-8 h-8 text-purple-400/50" />
                        </div>
                        <p className="text-gray-500 text-sm">Belum ada invoice</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  invoices.map((invoice) => (
                    <InvoiceRow
                      key={invoice.id}
                      invoice={invoice}
                      onSelect={setSelectedInvoice}
                      isSelected={selectedInvoice?.id === invoice.id}
                    />
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-5 py-3 border-t border-white/5 bg-[#0d1117] flex-shrink-0">
              <p className="text-xs text-gray-500">
                Menampilkan {(page - 1) * limit + 1}–{Math.min(page * limit, total)} dari {total} invoice
              </p>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="p-1.5 rounded-lg hover:bg-white/10 disabled:opacity-30 text-gray-400 hover:text-white transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span className="text-xs text-gray-400 px-2">
                  {page} / {totalPages}
                </span>
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="p-1.5 rounded-lg hover:bg-white/10 disabled:opacity-30 text-gray-400 hover:text-white transition-colors"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Right: Invoice Detail Panel */}
        <div className="w-[340px] xl:w-[360px] flex-shrink-0 overflow-hidden hidden lg:block">
          <InvoiceDetailPanel
            invoice={selectedInvoice}
            onClose={() => setSelectedInvoice(null)}
            onRefresh={handleRefresh}
          />
        </div>
      </div>
    </div>
  );
}
