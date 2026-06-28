'use client';

import { useQuery } from '@tanstack/react-query';
import { 
  TrendingUp, 
  Users, 
  ShoppingCart, 
  Activity,
  Calendar
} from 'lucide-react';
import { api } from '@/services/api';
import { SummaryCard } from '@/components/reports/SummaryCard';
import { RevenueChart } from '@/components/reports/RevenueChart';
import { CustomerGrowthChart } from '@/components/reports/CustomerGrowthChart';
import { OrderStatsChart } from '@/components/reports/OrderStatsChart';
import { TopCustomersTable } from '@/components/reports/TopCustomersTable';

export default function ReportsPage() {
  const { data: summary, isLoading: isLoadingSummary } = useQuery({
    queryKey: ['reports', 'summary'],
    queryFn: async () => {
      const { data } = await api.get('/reports/summary');
      return data;
    },
  });

  const { data: revenueTrend, isLoading: isLoadingRevenue } = useQuery({
    queryKey: ['reports', 'revenue-trend'],
    queryFn: async () => {
      const { data } = await api.get('/reports/revenue-trend');
      return data;
    },
  });

  const { data: customerGrowth, isLoading: isLoadingCustomers } = useQuery({
    queryKey: ['reports', 'customer-growth'],
    queryFn: async () => {
      const { data } = await api.get('/reports/customer-growth');
      return data;
    },
  });

  const { data: orderStats, isLoading: isLoadingOrders } = useQuery({
    queryKey: ['reports', 'order-stats'],
    queryFn: async () => {
      const { data } = await api.get('/reports/order-stats');
      return data;
    },
  });

  const { data: topCustomers, isLoading: isLoadingTopCustomers } = useQuery({
    queryKey: ['reports', 'top-customers'],
    queryFn: async () => {
      const { data } = await api.get('/reports/top-customers');
      return data;
    },
  });

  if (isLoadingSummary) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-emerald-500 border-t-transparent" />
      </div>
    );
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(value);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Laporan & Analitik</h1>
          <p className="text-gray-400">Ringkasan performa bisnis Anda</p>
        </div>
        <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-sm text-gray-300">
          <Calendar className="w-4 h-4 text-gray-400" />
          <span>30 Hari Terakhir</span>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <SummaryCard
          label="Total Pendapatan"
          value={formatCurrency(summary?.revenue?.current || 0)}
          icon={TrendingUp}
          color="text-emerald-500"
          iconBg="bg-emerald-500/10"
          growth={summary?.revenue?.growth}
          sub="vs bulan lalu"
        />
        <SummaryCard
          label="Total Pesanan"
          value={(summary?.orders?.current || 0).toString()}
          icon={ShoppingCart}
          color="text-blue-500"
          iconBg="bg-blue-500/10"
          growth={summary?.orders?.growth}
          sub="vs bulan lalu"
        />
        <SummaryCard
          label="Pelanggan Baru"
          value={(summary?.new_customers?.current || 0).toString()}
          icon={Users}
          color="text-purple-500"
          iconBg="bg-purple-500/10"
          growth={summary?.new_customers?.growth}
          sub="vs bulan lalu"
        />
        <SummaryCard
          label="Pengguna Aktif"
          value={(summary?.active_users?.current || 0).toString()}
          icon={Activity}
          color="text-orange-500"
          iconBg="bg-orange-500/10"
          growth={summary?.active_users?.growth}
          sub="vs bulan lalu"
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          {isLoadingRevenue ? (
            <div className="h-[400px] rounded-xl border border-white/10 bg-[#1A1A1A] animate-pulse" />
          ) : (
            <RevenueChart data={revenueTrend || []} />
          )}
        </div>
        <div>
          {isLoadingOrders ? (
            <div className="h-[400px] rounded-xl border border-white/10 bg-[#1A1A1A] animate-pulse" />
          ) : (
            <OrderStatsChart data={orderStats || []} />
          )}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div>
          {isLoadingCustomers ? (
            <div className="h-[400px] rounded-xl border border-white/10 bg-[#1A1A1A] animate-pulse" />
          ) : (
            <CustomerGrowthChart data={customerGrowth || []} />
          )}
        </div>
        <div>
          {isLoadingTopCustomers ? (
            <div className="h-[400px] rounded-xl border border-white/10 bg-[#1A1A1A] animate-pulse" />
          ) : (
            <TopCustomersTable data={topCustomers || []} />
          )}
        </div>
      </div>
    </div>
  );
}
