import { useQuery } from '@tanstack/react-query';
import {
  fetchExplorationZones,
  fetchZoneList,
  fetchProspectivityGrid,
  fetchMines,
  fetchGeology,
  fetchLineaments,
  fetchRoads,
} from '../services/zoneService';

export function useZones() {
  return useQuery({
    queryKey: ['zones'],
    queryFn: fetchExplorationZones,
    staleTime: 1000 * 60 * 10, // 10 mins
  });
}

export function useZoneList() {
  return useQuery({
    queryKey: ['zoneList'],
    queryFn: fetchZoneList,
    staleTime: 1000 * 60 * 10,
  });
}

export function useProspectivityGrid() {
  return useQuery({
    queryKey: ['prospectivityGrid'],
    queryFn: fetchProspectivityGrid,
    staleTime: 1000 * 60 * 10,
  });
}

export function useMines() {
  return useQuery({
    queryKey: ['mines'],
    queryFn: fetchMines,
    staleTime: 1000 * 60 * 10,
  });
}

export function useGeology() {
  return useQuery({
    queryKey: ['geology'],
    queryFn: fetchGeology,
    staleTime: 1000 * 60 * 10,
  });
}

export function useLineaments() {
  return useQuery({
    queryKey: ['lineaments'],
    queryFn: fetchLineaments,
    staleTime: 1000 * 60 * 10,
  });
}

export function useRoads() {
  return useQuery({
    queryKey: ['roads'],
    queryFn: fetchRoads,
    staleTime: 1000 * 60 * 10,
  });
}
