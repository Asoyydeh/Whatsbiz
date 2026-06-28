'use client';

import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { Plus } from 'lucide-react';
import { KanbanCard, Order } from './KanbanCard';
import { cn } from '@/lib/utils';

interface ColumnConfig {
  id: string;
  label: string;
  color: string;
  dotColor: string;
  bgColor: string;
}

export const COLUMN_CONFIGS: Record<string, ColumnConfig> = {
  DRAFT: {
    id: 'DRAFT',
    label: 'Draft',
    color: 'text-gray-400',
    dotColor: 'bg-gray-400',
    bgColor: 'bg-gray-500/5 border-gray-500/10',
  },
  PENDING: {
    id: 'PENDING',
    label: 'Pending',
    color: 'text-yellow-400',
    dotColor: 'bg-yellow-400',
    bgColor: 'bg-yellow-500/5 border-yellow-500/10',
  },
  PROCESSING: {
    id: 'PROCESSING',
    label: 'Processing',
    color: 'text-blue-400',
    dotColor: 'bg-blue-400',
    bgColor: 'bg-blue-500/5 border-blue-500/10',
  },
  COMPLETED: {
    id: 'COMPLETED',
    label: 'Selesai',
    color: 'text-emerald-400',
    dotColor: 'bg-emerald-400',
    bgColor: 'bg-emerald-500/5 border-emerald-500/10',
  },
};

interface Props {
  columnId: string;
  orders: Order[];
  onViewDetail: (order: Order) => void;
  onAddOrder: (status: string) => void;
}

export function KanbanColumn({ columnId, orders, onViewDetail, onAddOrder }: Props) {
  const { setNodeRef, isOver } = useDroppable({ id: columnId });
  const config = COLUMN_CONFIGS[columnId];
  const orderIds = orders.map((o) => o.id);

  const totalValue = orders.reduce((sum, o) => sum + o.total, 0);

  return (
    <div className="flex flex-col min-h-0 w-72 flex-shrink-0">
      {/* Column Header */}
      <div className={cn('flex items-center justify-between px-3 py-2.5 rounded-xl border mb-3', config.bgColor)}>
        <div className="flex items-center gap-2">
          <div className={cn('w-2 h-2 rounded-full', config.dotColor)} />
          <span className={cn('text-sm font-semibold', config.color)}>{config.label}</span>
          <span className="text-xs text-gray-500 bg-white/5 px-1.5 py-0.5 rounded-full">
            {orders.length}
          </span>
        </div>
        <div className="text-right">
          <p className="text-[10px] text-gray-500">Total</p>
          <p className={cn('text-xs font-bold', config.color)}>
            Rp {(totalValue / 1000).toFixed(0)}k
          </p>
        </div>
      </div>

      {/* Drop zone */}
      <div
        ref={setNodeRef}
        className={cn(
          'flex-1 min-h-[200px] flex flex-col gap-2 rounded-xl transition-all duration-200 p-1',
          isOver && 'bg-white/3 ring-1 ring-emerald-500/30 ring-dashed',
        )}
      >
        <SortableContext items={orderIds} strategy={verticalListSortingStrategy}>
          {orders.map((order) => (
            <KanbanCard key={order.id} order={order} onViewDetail={onViewDetail} />
          ))}
        </SortableContext>

        {/* Empty state */}
        {orders.length === 0 && !isOver && (
          <div className="flex-1 flex flex-col items-center justify-center py-8 text-center">
            <div className="w-10 h-10 rounded-xl border border-dashed border-white/10 flex items-center justify-center mb-2">
              <Plus className="w-4 h-4 text-gray-600" />
            </div>
            <p className="text-xs text-gray-600">Seret pesanan ke sini</p>
          </div>
        )}

        {/* Add button */}
        <button
          onClick={() => onAddOrder(columnId)}
          className="w-full flex items-center justify-center gap-1.5 py-2 rounded-lg border border-dashed border-white/10 text-gray-600 hover:text-gray-400 hover:border-white/20 text-xs transition-colors mt-1"
        >
          <Plus className="w-3.5 h-3.5" />
          Tambah Pesanan
        </button>
      </div>
    </div>
  );
}
