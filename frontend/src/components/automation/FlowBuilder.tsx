'use client';

import { useState, useCallback } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  X, Save, Zap, Plus, Trash2, ChevronDown,
  ArrowDown, Settings, CheckCircle, Loader2,
  AlertCircle, GitBranch,
} from 'lucide-react';
import { api } from '@/services/api';
import { cn } from '@/lib/utils';
import {
  TRIGGERS, ACTIONS, getTrigger, getAction,
  type AutomationFlow, type FlowNode,
} from '@/lib/automationConfig';

interface Props {
  initialData?: any;
  onSave: () => void;
  onCancel: () => void;
}

// ─── Sub-components ──────────────────────────────────────────────────────────

function ConnectorLine() {
  return (
    <div className="flex flex-col items-center my-1">
      <div className="w-px h-6 bg-gradient-to-b from-white/20 to-white/5" />
      <ArrowDown className="w-3 h-3 text-gray-600 -mt-1" />
    </div>
  );
}

interface NodeCardProps {
  type: 'trigger' | 'action' | 'add';
  config?: ReturnType<typeof getTrigger> | ReturnType<typeof getAction>;
  index?: number;
  onRemove?: () => void;
  children?: React.ReactNode;
  isEmpty?: boolean;
}

function NodeCard({ type, config, index, onRemove, children, isEmpty }: NodeCardProps) {
  const typeLabel = type === 'trigger' ? 'TRIGGER' : type === 'action' ? `AKSI ${(index || 0) + 1}` : '';

  return (
    <div className={cn(
      'relative rounded-2xl border overflow-hidden',
      type === 'trigger'
        ? 'border-blue-500/30 bg-blue-500/5'
        : type === 'action'
        ? 'border-purple-500/20 bg-purple-500/5'
        : 'border-dashed border-white/15 bg-white/3',
    )}>
      {/* Type badge */}
      {typeLabel && (
        <div className={cn(
          'px-3 py-1.5 flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider border-b',
          type === 'trigger'
            ? 'bg-blue-500/10 border-blue-500/20 text-blue-400'
            : 'bg-purple-500/10 border-purple-500/20 text-purple-400',
        )}>
          {type === 'trigger' ? <Zap className="w-3 h-3" /> : <Settings className="w-3 h-3" />}
          {typeLabel}
          {onRemove && (
            <button
              onClick={onRemove}
              className="ml-auto p-0.5 rounded hover:bg-white/10 text-gray-500 hover:text-red-400 transition-colors"
            >
              <Trash2 className="w-3 h-3" />
            </button>
          )}
        </div>
      )}
      <div className="p-4">{children}</div>
    </div>
  );
}

// ─── Trigger Selector ─────────────────────────────────────────────────────────

function TriggerSelector({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const selected = getTrigger(value);

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className={cn(
          'w-full flex items-center gap-3 p-3 rounded-xl border transition-all text-left',
          selected
            ? `${selected.bg} ${selected.border} hover:opacity-80`
            : 'bg-white/5 border-white/10 hover:border-white/20',
        )}
      >
        {selected ? (
          <>
            <span className="text-2xl">{selected.icon}</span>
            <div>
              <p className={cn('text-sm font-semibold', selected.text)}>{selected.label}</p>
              <p className="text-[10px] text-gray-500">{selected.description}</p>
            </div>
          </>
        ) : (
          <>
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 border-dashed flex items-center justify-center">
              <Plus className="w-4 h-4 text-blue-400" />
            </div>
            <p className="text-sm text-gray-500">Pilih trigger...</p>
          </>
        )}
        <ChevronDown className={cn('w-4 h-4 text-gray-500 ml-auto transition-transform', open && 'rotate-180')} />
      </button>

      {open && (
        <div className="absolute z-30 top-full mt-2 left-0 right-0 bg-[#1a2234] border border-white/10 rounded-xl shadow-2xl overflow-hidden">
          {TRIGGERS.map((t) => (
            <button
              key={t.value}
              onClick={() => { onChange(t.value); setOpen(false); }}
              className={cn(
                'w-full flex items-center gap-3 px-4 py-3 hover:bg-white/5 transition-colors text-left',
                value === t.value && 'bg-white/5',
              )}
            >
              <span className="text-xl">{t.icon}</span>
              <div>
                <p className={cn('text-sm font-medium', t.text)}>{t.label}</p>
                <p className="text-[10px] text-gray-500">{t.description}</p>
              </div>
              {value === t.value && <CheckCircle className="w-3.5 h-3.5 text-emerald-400 ml-auto" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Action Item ──────────────────────────────────────────────────────────────

function ActionItem({
  action,
  index,
  onChange,
  onRemove,
}: {
  action: { type: string; config: Record<string, any> };
  index: number;
  onChange: (a: { type: string; config: Record<string, any> }) => void;
  onRemove: () => void;
}) {
  const [open, setOpen] = useState(false);
  const selected = getAction(action.type);

  return (
    <NodeCard type="action" index={index} onRemove={onRemove}>
      {/* Action type selector */}
      <div className="relative mb-3">
        <button
          onClick={() => setOpen((v) => !v)}
          className={cn(
            'w-full flex items-center gap-3 p-3 rounded-xl border transition-all text-left',
            selected
              ? `${selected.bg} ${selected.border} hover:opacity-80`
              : 'bg-white/5 border-white/10 hover:border-white/20',
          )}
        >
          {selected ? (
            <>
              <span className="text-2xl">{selected.icon}</span>
              <div>
                <p className={cn('text-sm font-semibold', selected.text)}>{selected.label}</p>
                <p className="text-[10px] text-gray-500">{selected.description}</p>
              </div>
            </>
          ) : (
            <>
              <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 border-dashed flex items-center justify-center">
                <Plus className="w-4 h-4 text-purple-400" />
              </div>
              <p className="text-sm text-gray-500">Pilih aksi...</p>
            </>
          )}
          <ChevronDown className={cn('w-4 h-4 text-gray-500 ml-auto transition-transform', open && 'rotate-180')} />
        </button>

        {open && (
          <div className="absolute z-30 top-full mt-2 left-0 right-0 bg-[#1a2234] border border-white/10 rounded-xl shadow-2xl overflow-hidden">
            {ACTIONS.map((a) => (
              <button
                key={a.value}
                onClick={() => { onChange({ type: a.value, config: {} }); setOpen(false); }}
                className={cn(
                  'w-full flex items-center gap-3 px-4 py-3 hover:bg-white/5 transition-colors text-left',
                  action.type === a.value && 'bg-white/5',
                )}
              >
                <span className="text-xl">{a.icon}</span>
                <div>
                  <p className={cn('text-sm font-medium', a.text)}>{a.label}</p>
                  <p className="text-[10px] text-gray-500">{a.description}</p>
                </div>
                {action.type === a.value && <CheckCircle className="w-3.5 h-3.5 text-emerald-400 ml-auto" />}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Config fields for selected action */}
      {selected?.fields?.map((field) => (
        <div key={field.key} className="mb-2">
          <label className="text-[10px] text-gray-500 uppercase tracking-wider font-semibold mb-1 block">
            {field.label}
          </label>
          {field.type === 'textarea' ? (
            <textarea
              value={action.config[field.key] || ''}
              onChange={(e) => onChange({ ...action, config: { ...action.config, [field.key]: e.target.value } })}
              placeholder={(field as any).placeholder}
              rows={3}
              className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white placeholder-gray-600 focus:outline-none focus:border-purple-500/50 resize-none"
            />
          ) : field.type === 'select' ? (
            <select
              value={action.config[field.key] || ''}
              onChange={(e) => onChange({ ...action, config: { ...action.config, [field.key]: e.target.value } })}
              className="w-full px-3 py-2 bg-[#1a2234] border border-white/10 rounded-lg text-sm text-white focus:outline-none focus:border-purple-500/50"
            >
              <option value="">Pilih...</option>
              {((field as any).options as string[])?.map((opt: string) => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>
          ) : (
            <input
              type={field.type}
              value={action.config[field.key] || ''}
              onChange={(e) => onChange({ ...action, config: { ...action.config, [field.key]: e.target.value } })}
              placeholder={(field as any).placeholder}
              className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white placeholder-gray-600 focus:outline-none focus:border-purple-500/50"
            />
          )}
        </div>
      ))}
    </NodeCard>
  );
}

// ─── Main Flow Builder ────────────────────────────────────────────────────────

export function FlowBuilder({ initialData, onSave, onCancel }: Props) {
  const queryClient = useQueryClient();
  const isEditing = !!initialData?.id;

  const [name, setName] = useState(initialData?.name || '');
  const [description, setDescription] = useState(initialData?.description || '');
  const [trigger, setTrigger] = useState(initialData?.trigger || '');
  const [actions, setActions] = useState<{ type: string; config: Record<string, any> }[]>(
    initialData?.actions || [],
  );

  const saveMutation = useMutation({
    mutationFn: (data: any) =>
      isEditing
        ? api.put(`/automation/${initialData.id}`, data).then((r) => r.data)
        : api.post('/automation', data).then((r) => r.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['automations'] });
      onSave();
    },
  });

  const handleSave = () => {
    if (!name.trim() || !trigger) return;

    saveMutation.mutate({
      name: name.trim(),
      description: description.trim(),
      trigger,
      trigger_config: {},
      conditions: [],
      actions,
      flow_nodes: [],
      flow_edges: [],
    });
  };

  const addAction = () => {
    setActions((prev) => [...prev, { type: '', config: {} }]);
  };

  const updateAction = (index: number, updated: { type: string; config: Record<string, any> }) => {
    setActions((prev) => prev.map((a, i) => (i === index ? updated : a)));
  };

  const removeAction = (index: number) => {
    setActions((prev) => prev.filter((_, i) => i !== index));
  };

  const isValid = name.trim() && trigger && actions.length > 0 && actions.every((a) => a.type);

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-white/5 flex-shrink-0">
        <div>
          <h2 className="text-sm font-bold text-white">
            {isEditing ? 'Edit Automation' : 'Buat Automation Baru'}
          </h2>
          <p className="text-xs text-gray-500">Atur alur kerja otomatis Anda</p>
        </div>
        <button onClick={onCancel} className="p-2 hover:bg-white/10 rounded-lg transition-colors">
          <X className="w-4 h-4 text-gray-400" />
        </button>
      </div>

      {/* Form */}
      <div className="flex-1 overflow-y-auto custom-scrollbar px-5 py-4 space-y-4">
        {/* Name & Description */}
        <div className="space-y-3">
          <div>
            <label className="text-[10px] text-gray-500 uppercase tracking-wider font-semibold mb-1.5 block">
              Nama Automation *
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="contoh: Selamat Datang Pelanggan Baru"
              className="w-full px-3 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm text-white placeholder-gray-600 focus:outline-none focus:border-purple-500/50"
            />
          </div>
          <div>
            <label className="text-[10px] text-gray-500 uppercase tracking-wider font-semibold mb-1.5 block">
              Deskripsi
            </label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Apa yang dilakukan automation ini?"
              className="w-full px-3 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm text-white placeholder-gray-600 focus:outline-none focus:border-purple-500/50"
            />
          </div>
        </div>

        {/* Visual Flow */}
        <div>
          <p className="text-[10px] text-gray-500 uppercase tracking-wider font-semibold mb-3 flex items-center gap-2">
            <GitBranch className="w-3 h-3" />
            Alur Kerja
          </p>

          {/* TRIGGER NODE */}
          <NodeCard type="trigger">
            <TriggerSelector value={trigger} onChange={setTrigger} />
          </NodeCard>

          {/* ACTIONS */}
          {actions.map((action, i) => (
            <div key={i}>
              <ConnectorLine />
              <ActionItem
                action={action}
                index={i}
                onChange={(updated) => updateAction(i, updated)}
                onRemove={() => removeAction(i)}
              />
            </div>
          ))}

          {/* ADD ACTION */}
          <ConnectorLine />
          <button
            onClick={addAction}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border border-dashed border-white/15 text-gray-500 hover:text-gray-300 hover:border-white/30 bg-white/3 hover:bg-white/5 transition-all text-sm"
          >
            <Plus className="w-4 h-4" />
            Tambah Aksi
          </button>
        </div>

        {/* Validation hint */}
        {!isValid && (name || trigger) && (
          <div className="flex items-start gap-2 p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-xl">
            <AlertCircle className="w-3.5 h-3.5 text-yellow-400 flex-shrink-0 mt-0.5" />
            <p className="text-xs text-yellow-400">
              Lengkapi nama, trigger, dan minimal satu aksi sebelum menyimpan.
            </p>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="px-5 py-4 border-t border-white/5 bg-[#0d1117] flex gap-2 flex-shrink-0">
        <button
          onClick={onCancel}
          className="flex-1 py-2.5 rounded-xl bg-white/5 border border-white/10 text-gray-400 text-sm hover:text-white transition-colors"
        >
          Batal
        </button>
        <button
          onClick={handleSave}
          disabled={!isValid || saveMutation.isPending}
          className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-purple-500 hover:bg-purple-400 disabled:opacity-30 disabled:cursor-not-allowed text-white font-semibold text-sm transition-all shadow-lg shadow-purple-500/20"
        >
          {saveMutation.isPending ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Save className="w-4 h-4" />
          )}
          {isEditing ? 'Simpan Perubahan' : 'Simpan & Aktifkan'}
        </button>
      </div>
    </div>
  );
}
