'use client';

import { Trophy, TrendingUp } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TopCustomer {
  id: string;
  name: string;
  total_spent: number;
  order_count: number;
}

interface Props {
  data: TopCustomer[];
}

export function TopCustomersTable({ data }: Props) {
  return (
    <div className="rounded-xl border border-white/10 bg-[#1A1A1A] overflow-hidden relative shadow-xl">
      <div className="p-6 border-b border-white/5 relative z-10">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-yellow-500/10 text-yellow-500">
            <Trophy className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white">Top Pelanggan</h3>
            <p className="text-sm text-gray-400">Berdasarkan total belanja</p>
          </div>
        </div>
      </div>
      
      <div className="overflow-x-auto relative z-10">
        <table className="w-full">
          <thead>
            <tr className="border-b border-white/5 bg-black/20">
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Pelanggan</th>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Total Belanja</th>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Jumlah Order</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {data.map((customer, index) => (
              <tr 
                key={customer.id} 
                className="hover:bg-white/[0.02] transition-colors"
              >
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      "w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold",
                      index === 0 ? "bg-yellow-500/20 text-yellow-500" :
                      index === 1 ? "bg-gray-300/20 text-gray-300" :
                      index === 2 ? "bg-amber-600/20 text-amber-600" :
                      "bg-white/5 text-gray-400"
                    )}>
                      {index + 1}
                    </div>
                    <span className="text-sm font-medium text-white">{customer.name}</span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="text-sm text-emerald-400 font-medium">
                    {new Intl.NumberFormat('id-ID', {
                      style: 'currency',
                      currency: 'IDR',
                      minimumFractionDigits: 0,
                    }).format(customer.total_spent)}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center gap-2 text-sm text-gray-300">
                    <span>{customer.order_count}</span>
                    <TrendingUp className="w-4 h-4 text-gray-500" />
                  </div>
                </td>
              </tr>
            ))}
            {data.length === 0 && (
              <tr>
                <td colSpan={3} className="px-6 py-8 text-center text-gray-500 text-sm">
                  Belum ada data pelanggan
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
