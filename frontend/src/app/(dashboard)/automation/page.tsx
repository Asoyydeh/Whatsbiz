'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Zap, Plus, Activity, ToggleLeft, ToggleRight } from 'lucide-react';
import { api } from '@/services/api';
import { AutomationList } from '@/components/automation/AutomationList';
import { FlowBuilder } from '@/components/automation/FlowBuilder';
import { cn } from '@/lib/utils';

export default function AutomationPage() {
  const [editingAutomation, setEditingAutomation] = useState<any | null | undefined>(undefined);
  // undefined = not editing | null = creating new | object = editing existing

  const { data: stats } = useQuery({
    queryKey: ['automation-stats'],
    queryFn: () => api.get('/automation/stats').then((r) => r.data),
  });

  const isBuilderOpen = editingAutomation !== undefined;

  return (
    <div className="h-full flex flex-col overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-white/5 bg-[#111827] flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-purple-500/15">
            <Zap className="w-5 h-5 text-purple-400" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-white">Automation Builder</h1>
            <p className="text-xs text-gray-500">Buat alur kerja otomatis untuk bisnis Anda</p>
          </div>
        </div>
        <button
          onClick={() => setEditingAutomation(null)}
          className="flex items-center gap-2 px-4 py-2 bg-purple-500 hover:bg-purple-400 text-white text-sm font-semibold rounded-xl transition-all shadow-lg shadow-purple-500/20"
        >
          <Plus className="w-4 h-4" />
          Buat Automation
        </button>
      </div>

      {/* Stats */}
      <div className="flex items-center gap-6 px-6 py-3 border-b border-white/5 bg-[#111827] flex-shrink-0">
        <div className="flex items-center gap-2">
          <Activity className="w-4 h-4 text-purple-400" />
          <span className="text-sm text-gray-400">
            <span className="font-bold text-white">{stats?.total || 0}</span> total automation
          </span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-sm text-gray-400">
            <span className="font-bold text-emerald-400">{stats?.active || 0}</span> aktif
          </span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-gray-600" />
          <span className="text-sm text-gray-400">
            <span className="font-bold text-gray-300">{stats?.inactive || 0}</span> nonaktif
          </span>
        </div>
      </div>

      {/* Main Layout */}
      <div className="flex-1 flex overflow-hidden">
        {/* LEFT: List of automations */}
        <div className={cn(
          'border-r border-white/5 bg-[#0d1117] overflow-hidden transition-all duration-300',
          isBuilderOpen ? 'w-[320px] flex-shrink-0' : 'flex-1',
        )}>
          <div className="h-full overflow-y-auto custom-scrollbar">
            {/* Column header */}
            <div className="sticky top-0 px-4 py-3 border-b border-white/5 bg-[#0d1117] z-10">
              <p className="text-xs font-semibold text-gray-400">Daftar Automation</p>
            </div>
            <AutomationList
              onEdit={(auto) => setEditingAutomation(auto || null)}
              editingId={editingAutomation?.id || null}
            />
          </div>
        </div>

        {/* RIGHT: Flow Builder panel */}
        {isBuilderOpen && (
          <div className="flex-1 overflow-hidden bg-[#111827]">
            <FlowBuilder
              initialData={editingAutomation || undefined}
              onSave={() => setEditingAutomation(undefined)}
              onCancel={() => setEditingAutomation(undefined)}
            />
          </div>
        )}

        {/* Empty state when builder is closed */}
        {!isBuilderOpen && (
          <div className="hidden" />
        )}
      </div>

      {/* Bottom tip when list is fullscreen */}
      {!isBuilderOpen && (
        <div className="px-6 py-3 border-t border-white/5 bg-[#0d1117] flex-shrink-0">
          <p className="text-xs text-gray-600 text-center">
            💡 Klik automation untuk mengedit, atau{' '}
            <button
              onClick={() => setEditingAutomation(null)}
              className="text-purple-400 hover:text-purple-300 underline"
            >
              buat yang baru
            </button>
          </p>
        </div>
      )}
    </div>
  );
}
