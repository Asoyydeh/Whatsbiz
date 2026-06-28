// Centralized config for all trigger types, condition fields, and action types
// Used by both the flow builder UI and the backend

export const TRIGGERS = [
  {
    value: 'NEW_CUSTOMER',
    label: 'Pelanggan Baru',
    description: 'Ketika pelanggan baru ditambahkan',
    icon: '👤',
    color: 'from-blue-500 to-indigo-500',
    bg: 'bg-blue-500/10',
    border: 'border-blue-500/30',
    text: 'text-blue-400',
  },
  {
    value: 'NEW_MESSAGE',
    label: 'Pesan Masuk',
    description: 'Ketika ada pesan WhatsApp baru',
    icon: '💬',
    color: 'from-emerald-500 to-teal-500',
    bg: 'bg-emerald-500/10',
    border: 'border-emerald-500/30',
    text: 'text-emerald-400',
  },
  {
    value: 'NEW_ORDER',
    label: 'Pesanan Baru',
    description: 'Ketika pesanan baru dibuat',
    icon: '🛒',
    color: 'from-orange-500 to-amber-500',
    bg: 'bg-orange-500/10',
    border: 'border-orange-500/30',
    text: 'text-orange-400',
  },
  {
    value: 'INVOICE_OVERDUE',
    label: 'Invoice Jatuh Tempo',
    description: 'Ketika invoice melewati tanggal jatuh tempo',
    icon: '⏰',
    color: 'from-red-500 to-rose-500',
    bg: 'bg-red-500/10',
    border: 'border-red-500/30',
    text: 'text-red-400',
  },
  {
    value: 'PAYMENT_RECEIVED',
    label: 'Pembayaran Diterima',
    description: 'Ketika pembayaran berhasil dicatat',
    icon: '💰',
    color: 'from-yellow-500 to-amber-500',
    bg: 'bg-yellow-500/10',
    border: 'border-yellow-500/30',
    text: 'text-yellow-400',
  },
  {
    value: 'ORDER_STATUS_CHANGED',
    label: 'Status Pesanan Berubah',
    description: 'Ketika status pesanan diperbarui',
    icon: '🔄',
    color: 'from-purple-500 to-violet-500',
    bg: 'bg-purple-500/10',
    border: 'border-purple-500/30',
    text: 'text-purple-400',
  },
];

export const ACTIONS = [
  {
    value: 'SEND_WHATSAPP',
    label: 'Kirim WhatsApp',
    description: 'Kirim pesan otomatis ke pelanggan',
    icon: '📱',
    color: 'from-emerald-500 to-green-500',
    bg: 'bg-emerald-500/10',
    border: 'border-emerald-500/30',
    text: 'text-emerald-400',
    fields: [{ key: 'message', label: 'Pesan', type: 'textarea', placeholder: 'Halo {{customer.name}}, ...' }],
  },
  {
    value: 'ASSIGN_STAFF',
    label: 'Assign Staff',
    description: 'Tetapkan staf ke percakapan',
    icon: '👨‍💼',
    color: 'from-blue-500 to-cyan-500',
    bg: 'bg-blue-500/10',
    border: 'border-blue-500/30',
    text: 'text-blue-400',
    fields: [{ key: 'staff_id', label: 'Staff', type: 'text', placeholder: 'ID Staff...' }],
  },
  {
    value: 'CREATE_INVOICE',
    label: 'Buat Invoice',
    description: 'Buat invoice otomatis dari pesanan',
    icon: '📄',
    color: 'from-purple-500 to-violet-500',
    bg: 'bg-purple-500/10',
    border: 'border-purple-500/30',
    text: 'text-purple-400',
    fields: [{ key: 'due_days', label: 'Jatuh tempo (hari)', type: 'number', placeholder: '7' }],
  },
  {
    value: 'UPDATE_CUSTOMER_STATUS',
    label: 'Update Status Pelanggan',
    description: 'Ubah status pelanggan secara otomatis',
    icon: '🏷️',
    color: 'from-orange-500 to-amber-500',
    bg: 'bg-orange-500/10',
    border: 'border-orange-500/30',
    text: 'text-orange-400',
    fields: [{ key: 'status', label: 'Status Baru', type: 'select', options: ['LEAD', 'PROSPECT', 'CUSTOMER', 'VIP', 'INACTIVE'] }],
  },
  {
    value: 'ADD_TAG',
    label: 'Tambah Tag',
    description: 'Tambahkan tag ke pelanggan',
    icon: '🔖',
    color: 'from-teal-500 to-cyan-500',
    bg: 'bg-teal-500/10',
    border: 'border-teal-500/30',
    text: 'text-teal-400',
    fields: [{ key: 'tag', label: 'Nama Tag', type: 'text', placeholder: 'VIP, Repeat, ...' }],
  },
  {
    value: 'SEND_NOTIFICATION',
    label: 'Notifikasi Internal',
    description: 'Kirim notifikasi ke tim internal',
    icon: '🔔',
    color: 'from-yellow-500 to-orange-500',
    bg: 'bg-yellow-500/10',
    border: 'border-yellow-500/30',
    text: 'text-yellow-400',
    fields: [{ key: 'message', label: 'Pesan Notifikasi', type: 'text', placeholder: 'Ada pelanggan baru!' }],
  },
];

export const getTrigger = (value: string) => TRIGGERS.find((t) => t.value === value);
export const getAction = (value: string) => ACTIONS.find((a) => a.value === value);

export interface FlowNode {
  id: string;
  type: 'trigger' | 'condition' | 'action';
  data: {
    triggerType?: string;
    actionType?: string;
    config?: Record<string, any>;
    label?: string;
  };
}

export interface AutomationFlow {
  trigger: string;
  trigger_config: Record<string, any>;
  conditions: any[];
  actions: { type: string; config: Record<string, any> }[];
  flow_nodes: FlowNode[];
  flow_edges: any[];
}
