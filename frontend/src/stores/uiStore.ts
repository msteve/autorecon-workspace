import { create } from 'zustand';

interface UIState {
  sidebarCollapsed: boolean;
  activeFilters: Record<string, any>;
  setSidebarCollapsed: (collapsed: boolean) => void;
  setActiveFilters: (filters: Record<string, any>) => void;
  clearFilters: () => void;
}

export const useUIStore = create<UIState>((set) => ({
  sidebarCollapsed: false,
  activeFilters: {},
  setSidebarCollapsed: (collapsed) => set({ sidebarCollapsed: collapsed }),
  setActiveFilters: (filters) => set({ activeFilters: filters }),
  clearFilters: () => set({ activeFilters: {} }),
}));
