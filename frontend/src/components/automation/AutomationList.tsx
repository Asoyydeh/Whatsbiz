'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Plus, Zap, ToggleLeft, ToggleRight, Trash2, Edit3,
  Play, Pause, ChevronRight, Settings,
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { id } from 'date-fns/locale';
import { api } from '@/services/api';
import { cn } from '@/lib/utils';
import { getTrigger, getAction } from '@/lib/automationConfig';

interface Automation {
  id: string;
  name: string;
  description?: string;
  trigger: string;
  actions: { type: string; config: Record<string, any> }[];
  is_active: boolean;
  created_at: string;
}

interface Props {
  onEdit: (automation: Automation | null) => void;
  editingId: string | null;
}

export function AutomationList({ onEdit, editingId }: Props) {
  const queryClient = useQueryClient();

  const { data: automations = [], isLoading } = useQuery({
    queryKey: ['automations'],
    queryFn: () => api.get('/automation').then((r) => r.data),
  });

  const toggleMutation = useMutation({
    mutationFn: ({ id, is_active }: { id: string; is_active: boolean }) =>
      api.patch(`/automation/${id}/toggle`, { is_active }).then((r) => r.data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['automations'] }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/automation/${id}`).then((r) => r.data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['automations'] }),
  });

  if (isLoading) {
    return (
      <div className="space-y-3 p-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="h-20 bg-white/5 rounded-xl animate-pulse" />
        ))}
      </div>
    );
  }

  if (automations.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center px-6">
        <div className="p-4 rounded-2xl bg-purple-500/10 mb-4">
          <Zap className="w-8 h-8 text-purple-400" />
        </div>
        <h3 className="text-sm font-semibold text-white mb-1">Belum ada automation</h3>
        <p className="text-xs text-gray-500 mb-4">Buat automation pertama Anda untuk mengotomatiskan alur kerja</p>
        <button
          onClick={() => onEdit(null)}
          className="flex items-center gap-2 px-4 py-2 bg-purple-500 hover:bg-purple-400 text-white text-sm rounded-xl transition-colors"
        >
          <Plus className="w-4 h-4" />
          Buat Automation
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2 p-4">
      {(automations as Automation[]).map((auto) => {
        const triggerConfig = getTrigger(auto.trigger);
        const actionList = (auto.actions || []).slice(0, 3);

        return (
          <div
            key={auto.id}
            onClick={() => onEdit(auto)}
            className={cn(
              'group relative rounded-xl border p-4 cursor-pointer transition-all duration-200',
              'hover:border-white/20 hover:bg-white/5',
              editingId === auto.id
                ? 'bg-purple-500/10 border-purple-500/40'
                : 'bg-white/3 border-white/5',
            )}
          >
            {/* Active indicator */}
            <div className={cn(
              'absolute top-4 right-4 w-2 h-2 rounded-full',
              auto.is_active ? 'bg-emerald-400 shadow-lg shadow-emerald-400/50' : 'bg-gray-600',
            )} />

            {/* Header */}
            <div className="flex items-start gap-3 mb-3 pr-6">
              <span className="text-xl">{triggerConfig?.icon || '⚡'}</span>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-white truncate">{auto.name}</p>
                <p className="text-[10px] text-gray-500 mt-0.5">
                  {triggerConfig?.label || auto.trigger}
                </p>
              </div>
            </div>

            {/* Flow preview */}
            <div className="flex items-center gap-1 flex-wrap mb-3">
              <span className={cn(
                'text-[10px] px-2 py-0.5 rounded-full border',
                triggerConfig?.bg,
                triggerConfig?.border,
                triggerConfig?.text,
              )}>
                {triggerConfig?.label || 'Trigger'}
              </span>
              {actionList.map((action, i) => {
                const actionConfig = getAction(action.type);
                return (
                  <span key={i} className="flex items-center gap-1">
                    <ChevronRight className="w-2.5 h-2.5 text-gray-600" />
                    <span className={cn(
                      'text-[10px] px-2 py-0.5 rounded-full border',
                      actionConfig?.bg,
                      actionConfig?.border,
                      actionConfig?.text,
                    )}>
                      {actionConfig?.icon} {actionConfig?.label || action.type}
                    </span>
                  </span>
                );
              })}
              {(auto.actions || []).length > 3 && (
                <span className="text-[10px] text-gray-500">+{(auto.actions || []).length - 3}</span>
              )}
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-gray-600">
                {formatDistanceToNow(new Date(auto.created_at), { addSuffix: true, locale: id })}
              </span>
              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleMutation.mutate({ id: auto.id, is_active: !auto.is_active });
                  }}
                  className="p-1.5 rounded-lg hover:bg-white/10 transition-colors"
                  title={auto.is_active ? 'Nonaktifkan' : 'Aktifkan'}
                >
                  {auto.is_active
                    ? <Pause className="w-3.5 h-3.5 text-yellow-400" />
                    : <Play className="w-3.5 h-3.5 text-emerald-400" />}
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    if (confirm(`Hapus automation "${auto.name}"?`)) {
                      deleteMutation.mutate(auto.id);
                    }
                  }}
                  className="p-1.5 rounded-lg hover:bg-red-500/20 text-gray-500 hover:text-red-400 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
