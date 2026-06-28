'use client';

import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Props {
  icon: any;
  label: string;
  value: string;
  sub?: string;
  growth?: number;
  color: string;
  iconBg: string;
}

export function SummaryCard({ icon: Icon, label, value, sub, growth, color, iconBg }: Props) {
  const isPositive = (growth ?? 0) >= 0;
  const GrowthIcon = growth === undefined ? Minus : isPositive ? TrendingUp : TrendingDown;

  return (
    <div className="relative overflow-hidden rounded-2xl border border-white/5 bg-[#1a2234] p-5 group hover:border-white/10 transition-all">
      {/* Background glow */}
      <div className={cn('absolute -right-4 -top-4 w-24 h-24 rounded-full blur-2xl opacity-20', iconBg)} />

      <div className="flex items-start justify-between mb-4">
        <div className={cn('p-2.5 rounded-xl', iconBg, 'bg-opacity-15')}>
          <Icon className={cn('w-5 h-5', color)} />
        </div>
        {growth !== undefined && (
          <div className={cn(
            'flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-full',
            isPositive
              ? 'bg-emerald-500/10 text-emerald-400'
              : 'bg-red-500/10 text-red-400',
          )}>
            <GrowthIcon className="w-3 h-3" />
            {Math.abs(growth)}%
          </div>
        )}
      </div>

      <div>
        <p className="text-2xl font-bold text-white mb-0.5">{value}</p>
        <p className="text-xs text-gray-500">{label}</p>
        {sub && <p className="text-[10px] text-gray-600 mt-1">{sub}</p>}
      </div>
    </div>
  );
}
