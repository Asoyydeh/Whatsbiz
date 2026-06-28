'use client';

import { useState, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  DndContext,
  DragEndEvent,
  DragOverEvent,
  DragStartEvent,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  closestCorners,
} from '@dnd-kit/core';
import { arrayMove } from '@dnd-kit/sortable';
import {
  ShoppingBag,
  Plus,
  RefreshCw,
  BarChart3,
  TrendingUp,
  Clock,
  CheckCircle,
} from 'lucide-react';
import { api } from '@/services/api';
import { KanbanColumn, COLUMN_CONFIGS } from '@/components/orders/KanbanColumn';
import { KanbanCard, Order } from '@/components/orders/KanbanCard';
import { OrderDetailModal } from '@/components/orders/OrderDetailModal';
import { CreateOrderModal } from '@/components/orders/CreateOrderModal';
import { cn } from '@/lib/utils';

type KanbanBoard = Record<string, Order[]>;

const COLUMN_ORDER = ['DRAFT', 'PENDING', 'PROCESSING', 'COMPLETED'];

function StatCard({
  icon: Icon,
  label,
  value,
  color,
}: {
  icon: any;
  label: string;
  value: string;
  color: string;
}) {
  return (
    <div className={cn('flex items-center gap-3 px-4 py-3 rounded-xl border bg-white/3', color)}>
      <Icon className="w-4 h-4 flex-shrink-0" />
      <div>
        <p className="text-xs text-gray-500">{label}</p>
        <p className="text-sm font-bold text-white">{value}</p>
      </div>
    </div>
  );
}

export default function OrdersPage() {
  const [board, setBoard] = useState<KanbanBoard>({});
  const [activeOrder, setActiveOrder] = useState<Order | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [createDefaultStatus, setCreateDefaultStatus] = useState('PENDING');
  const queryClient = useQueryClient();

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
  );

  // Fetch kanban board data
  const { isLoading, refetch } = useQuery({
    queryKey: ['orders-kanban'],
    queryFn: () => api.get('/orders/kanban').then((r) => r.data),
    onSuccess: (data: KanbanBoard) => {
      setBoard(data);
    },
  } as any);

  // Fetch stats
  const { data: stats } = useQuery({
    queryKey: ['orders-stats'],
    queryFn: () => api.get('/orders/stats').then((r) => r.data),
  });

  // Mutation: update order status
  const updateStatus = useMutation({
    mutationFn: ({ orderId, status }: { orderId: string; status: string }) =>
      api.patch(`/orders/${orderId}/status`, { status }).then((r) => r.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders-kanban'] });
      queryClient.invalidateQueries({ queryKey: ['orders-stats'] });
    },
  });

  const handleUpdateStatus = useCallback(
    async (orderId: string, status: string) => {
      await updateStatus.mutateAsync({ orderId, status });
    },
    [updateStatus],
  );

  // --- DnD handlers ---
  const findColumn = (orderId: string): string | null => {
    for (const [colId, orders] of Object.entries(board)) {
      if (orders.find((o) => o.id === orderId)) return colId;
    }
    return null;
  };

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const colId = findColumn(active.id as string);
    if (colId) {
      const order = board[colId].find((o) => o.id === active.id);
      setActiveOrder(order || null);
    }
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    if (!over) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    const activeColumn = findColumn(activeId);
    // over could be a column ID or card ID
    const overColumn = COLUMN_ORDER.includes(overId) ? overId : findColumn(overId);

    if (!activeColumn || !overColumn || activeColumn === overColumn) return;

    setBoard((prev) => {
      const activeItems = [...prev[activeColumn]];
      const overItems = [...prev[overColumn]];
      const activeIndex = activeItems.findIndex((o) => o.id === activeId);
      const overIndex = overItems.findIndex((o) => o.id === overId);

      const [movedOrder] = activeItems.splice(activeIndex, 1);
      const updatedOrder = { ...movedOrder, status: overColumn };
      overItems.splice(overIndex >= 0 ? overIndex : overItems.length, 0, updatedOrder);

      return { ...prev, [activeColumn]: activeItems, [overColumn]: overItems };
    });
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveOrder(null);

    if (!over) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    const activeColumn = findColumn(activeId);
    const overColumn = COLUMN_ORDER.includes(overId) ? overId : findColumn(overId);

    if (!activeColumn || !overColumn) return;

    if (activeColumn !== overColumn) {
      // Persist the status change to backend
      try {
        await handleUpdateStatus(activeId, overColumn);
      } catch {
        // Revert on error by re-fetching
        refetch();
      }
    } else {
      // Reorder within same column
      setBoard((prev) => {
        const items = [...prev[activeColumn]];
        const from = items.findIndex((o) => o.id === activeId);
        const to = items.findIndex((o) => o.id === overId);
        return { ...prev, [activeColumn]: arrayMove(items, from, to) };
      });
    }
  };

  const totalOrders = COLUMN_ORDER.reduce((sum, col) => sum + (board[col]?.length || 0), 0);
  const totalRevenue = stats?.totalRevenue || 0;

  return (
    <div className="h-full flex flex-col overflow-hidden">
      {/* Page Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-white/5 bg-[#111827] flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-blue-500/15">
            <ShoppingBag className="w-5 h-5 text-blue-400" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-white">Manajemen Pesanan</h1>
            <p className="text-xs text-gray-500">Drag & drop untuk update status pesanan</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => refetch()}
            className="p-2 rounded-lg hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
            title="Refresh"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <button
            onClick={() => { setCreateDefaultStatus('PENDING'); setIsCreateModalOpen(true); }}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-white text-sm font-semibold rounded-xl transition-all shadow-lg shadow-emerald-500/20"
          >
            <Plus className="w-4 h-4" />
            Pesanan Baru
          </button>
        </div>
      </div>

      {/* Stats Bar */}
      <div className="flex gap-3 px-6 py-3 border-b border-white/5 bg-[#111827] flex-shrink-0 overflow-x-auto">
        <StatCard
          icon={ShoppingBag}
          label="Total Pesanan"
          value={`${totalOrders} pesanan`}
          color="border-blue-500/20"
        />
        <StatCard
          icon={Clock}
          label="Pending"
          value={`${board['PENDING']?.length || 0} pesanan`}
          color="border-yellow-500/20"
        />
        <StatCard
          icon={BarChart3}
          label="Diproses"
          value={`${board['PROCESSING']?.length || 0} pesanan`}
          color="border-blue-500/20"
        />
        <StatCard
          icon={CheckCircle}
          label="Selesai"
          value={`${board['COMPLETED']?.length || 0} pesanan`}
          color="border-emerald-500/20"
        />
        <StatCard
          icon={TrendingUp}
          label="Revenue Selesai"
          value={`Rp ${(totalRevenue / 1000000).toFixed(1)}jt`}
          color="border-emerald-500/20"
        />
      </div>

      {/* Kanban Board */}
      <div className="flex-1 overflow-auto">
        {isLoading ? (
          <div className="flex gap-4 p-6 h-full">
            {COLUMN_ORDER.map((col) => (
              <div key={col} className="w-72 flex-shrink-0 space-y-3 animate-pulse">
                <div className="h-10 bg-white/5 rounded-xl" />
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="h-28 bg-white/5 rounded-xl" />
                ))}
              </div>
            ))}
          </div>
        ) : (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCorners}
            onDragStart={handleDragStart}
            onDragOver={handleDragOver}
            onDragEnd={handleDragEnd}
          >
            <div className="flex gap-4 p-6 h-full min-w-max">
              {COLUMN_ORDER.map((colId) => (
                <KanbanColumn
                  key={colId}
                  columnId={colId}
                  orders={board[colId] || []}
                  onViewDetail={setSelectedOrder}
                  onAddOrder={(status) => { setCreateDefaultStatus(status); setIsCreateModalOpen(true); }}
                />
              ))}
            </div>

            {/* Drag overlay — renders the card being dragged */}
            <DragOverlay>
              {activeOrder ? (
                <div className="rotate-2 scale-105">
                  <KanbanCard order={activeOrder} onViewDetail={() => {}} />
                </div>
              ) : null}
            </DragOverlay>
          </DndContext>
        )}
      </div>

      {/* Order Detail Side Panel */}
      <OrderDetailModal
        order={selectedOrder}
        onClose={() => setSelectedOrder(null)}
        onStatusChange={handleUpdateStatus}
      />

      {/* Create Order Modal */}
      <CreateOrderModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        defaultStatus={createDefaultStatus}
      />
    </div>
  );
}
