'use client';

import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend
} from 'recharts';

interface Props {
  data: { status: string; count: number }[];
}

const COLORS: Record<string, string> = {
  PENDING: '#f59e0b',
  PROCESSING: '#3b82f6',
  SHIPPED: '#8b5cf6',
  COMPLETED: '#10b981',
  CANCELLED: '#ef4444',
};

const LABELS: Record<string, string> = {
  PENDING: 'Menunggu',
  PROCESSING: 'Diproses',
  SHIPPED: 'Dikirim',
  COMPLETED: 'Selesai',
  CANCELLED: 'Batal',
};

export function OrderStatsChart({ data }: Props) {
  const formattedData = data.map((item) => ({
    name: LABELS[item.status] || item.status,
    value: item.count,
    color: COLORS[item.status] || '#8884d8',
  }));

  return (
    <div className="rounded-xl border border-white/10 bg-[#1A1A1A] p-6 shadow-xl relative overflow-hidden group h-full">
      <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-transparent to-cyan-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      
      <div className="mb-6 flex items-center justify-between relative z-10">
        <div>
          <h3 className="text-lg font-semibold text-white">Status Pesanan</h3>
          <p className="text-sm text-gray-400">Distribusi status saat ini</p>
        </div>
      </div>

      <div className="h-[250px] w-full relative z-10 flex items-center justify-center">
        {formattedData.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={formattedData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                paddingAngle={5}
                dataKey="value"
              >
                {formattedData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} stroke="rgba(0,0,0,0)" />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{
                  backgroundColor: '#1A1A1A',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '8px',
                  color: '#fff',
                }}
                itemStyle={{ color: '#fff' }}
              />
              <Legend 
                verticalAlign="bottom" 
                height={36}
                formatter={(value, entry: any) => (
                  <span className="text-gray-300 text-sm ml-1">{value}</span>
                )}
              />
            </PieChart>
          </ResponsiveContainer>
        ) : (
          <div className="text-gray-500 text-sm">Belum ada data pesanan</div>
        )}
      </div>
    </div>
  );
}
