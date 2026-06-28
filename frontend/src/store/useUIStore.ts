import { create } from 'zustand';

interface UIState {
  sidebarOpen: boolean;
  selectedCustomerId: string | null;
  selectedConversationId: string | null;
  crmActiveTab: 'overview' | 'orders' | 'messages' | 'payments' | 'tasks';
  
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
  setSelectedCustomerId: (id: string | null) => void;
  setSelectedConversationId: (id: string | null) => void;
  setCrmActiveTab: (tab: 'overview' | 'orders' | 'messages' | 'payments' | 'tasks') => void;
  resetUI: () => void;
}

export const useUIStore = create<UIState>((set) => ({
  sidebarOpen: true,
  selectedCustomerId: null,
  selectedConversationId: null,
  crmActiveTab: 'overview',

  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
  setSelectedCustomerId: (id) => set({ selectedCustomerId: id }),
  setSelectedConversationId: (id) => set({ selectedConversationId: id }),
  setCrmActiveTab: (tab) => set({ crmActiveTab: tab }),
  resetUI: () => set({ selectedCustomerId: null, selectedConversationId: null, crmActiveTab: 'overview' }),
}));
