import { create } from 'zustand';
import { PriorityWeights, DataMode } from '../types/domain';
import { DEFAULT_PRIORITY_WEIGHTS, renormalizeWeights } from '../lib/scoring';

interface MapLayerState {
  prospectivity: boolean;
  mines: boolean;
  geology: boolean;
  lineaments: boolean;
  elevation: boolean;
  roads: boolean;
  satellite: boolean;
  confidenceOverlay: boolean;
}

interface AppState {
  // Zone selection
  selectedZoneId: string | null;
  setSelectedZoneId: (zoneId: string | null) => void;

  // Data honesty & settings
  dataMode: DataMode;
  setDataMode: (mode: DataMode) => void;
  simulateError: boolean;
  setSimulateError: (sim: boolean) => void;

  // Filters
  regionId: string;
  setRegionId: (region: string) => void;
  dateRange: string; // '3m' | '6m' | '12m' | 'all'
  setDateRange: (range: string) => void;

  // UI layout
  sidebarCollapsed: boolean;
  toggleSidebar: () => void;
  setSidebarCollapsed: (collapsed: boolean) => void;

  // Exploration Priority Engine state
  priorityWeights: PriorityWeights;
  setPriorityWeights: (weights: PriorityWeights) => void;
  resetPriorityWeights: () => void;
  explorationBudget: number; // e.g. cost index sum budget
  setExplorationBudget: (budget: number) => void;

  // Map state
  visibleLayers: MapLayerState;
  toggleLayer: (layerKey: keyof MapLayerState) => void;
  layerOpacity: number;
  setLayerOpacity: (opacity: number) => void;
  basemap: 'satellite' | 'terrain' | 'dark';
  setBasemap: (basemap: 'satellite' | 'terrain' | 'dark') => void;
}

const INITIAL_LAYERS: MapLayerState = {
  prospectivity: true,
  mines: true,
  geology: true,
  lineaments: true,
  elevation: false,
  roads: true,
  satellite: false,
  confidenceOverlay: false,
};

export const useAppStore = create<AppState>((set) => ({
  selectedZoneId: 'MN-047', // default selected zone per requirements
  setSelectedZoneId: (zoneId) => set({ selectedZoneId: zoneId }),

  dataMode: 'demo',
  setDataMode: (mode) => set({ dataMode: mode }),
  simulateError: false,
  setSimulateError: (sim) => set({ simulateError: sim }),

  regionId: 'all',
  setRegionId: (region) => set({ regionId: region }),
  dateRange: '12m',
  setDateRange: (range) => set({ dateRange: range }),

  sidebarCollapsed: localStorage.getItem('sidebar_collapsed') === 'true',
  toggleSidebar: () =>
    set((state) => {
      const next = !state.sidebarCollapsed;
      localStorage.setItem('sidebar_collapsed', String(next));
      return { sidebarCollapsed: next };
    }),
  setSidebarCollapsed: (collapsed) => {
    localStorage.setItem('sidebar_collapsed', String(collapsed));
    set({ sidebarCollapsed: collapsed });
  },

  priorityWeights: DEFAULT_PRIORITY_WEIGHTS,
  setPriorityWeights: (weights) => set({ priorityWeights: renormalizeWeights(weights) }),
  resetPriorityWeights: () => set({ priorityWeights: DEFAULT_PRIORITY_WEIGHTS }),
  explorationBudget: 250, // default budget cost index
  setExplorationBudget: (budget) => set({ explorationBudget: budget }),

  visibleLayers: INITIAL_LAYERS,
  toggleLayer: (layerKey) =>
    set((state) => ({
      visibleLayers: {
        ...state.visibleLayers,
        [layerKey]: !state.visibleLayers[layerKey],
      },
    })),
  layerOpacity: 0.75,
  setLayerOpacity: (opacity) => set({ layerOpacity: opacity }),
  basemap: 'satellite',
  setBasemap: (basemap) => set({ basemap }),
}));
