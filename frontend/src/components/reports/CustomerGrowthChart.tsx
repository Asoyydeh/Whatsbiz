'use client';

import {
  Line,
  LineChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';

interface Props {
  data: { month: string; new_customers: number; total: number }[];
}

export function CustomerGrowthChart({ data }: Props) {
  const formattedData = data.map((item) => ({
    ...item,
    formattedMonth: item.month,
  }));

  return (
    <div className="rounded-xl border border-white/10 bg-[#1A1A1A] p-6 shadow-xl relative overflow-hidden group">
      <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 via-transparent to-teal-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      
      <div className="mb-6 flex items-center justify-between relative z-10">
        <div>
          <h3 className="text-lg font-semibold text-white">Pertumbuhan Pelanggan</h3>
          <p className="text-sm text-gray-400">6 bulan terakhir</p>
        </div>
      </div>

      <div className="h-[300px] w-full relative z-10">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={formattedData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
            <XAxis
              dataKey="formattedMonth"
              stroke="#666"
              fontSize={12}
              tickLine={false}
              axisLine={false}
              dy={10}
            />
            <YAxis
              stroke="#666"
              fontSize={12}
              tickLine={false}
              axisLine={false}
              dx={-10}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: '#1A1A1A',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '8px',
                color: '#fff',
              }}
              itemStyle={{ color: '#fff' }}
              labelStyle={{ color: '#9ca3af', marginBottom: '4px' }}
            />
            <Line
              type="monotone"
              dataKey="total"
              name="Total Pelanggan"
              stroke="#10b981"
              strokeWidth={3}
              dot={{ r: 4, fill: '#1A1A1A', strokeWidth: 2 }}
              activeDot={{ r: 6, strokeWidth: 0, fill: '#10b981' }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
