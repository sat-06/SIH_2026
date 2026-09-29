import { mockFetch } from './apiClient';
import {
  ALL_ZONES,
  getZonesGeoJSON,
  getProspectivityPointsGeoJSON,
  getMinesGeoJSON,
  getGeologyGeoJSON,
  getLineamentsGeoJSON,
  getRoadsGeoJSON,
} from '../mocks/seed';
import {
  ZoneProperties,
  ZoneCollection,
  ProspectivityPointCollection,
  MineCollection,
  GeologyCollection,
  LineamentCollection,
  RoadCollection,
} from '../types/domain';

export async function fetchExplorationZones(): Promise<ZoneCollection> {
  return mockFetch(getZonesGeoJSON());
}

export async function fetchZoneList(): Promise<ZoneProperties[]> {
  return mockFetch(ALL_ZONES);
}

export async function fetchZoneById(id: string): Promise<ZoneProperties | null> {
  const zone = ALL_ZONES.find((z) => z.id.toUpperCase() === id.toUpperCase());
  return mockFetch(zone || null);
}

export async function fetchProspectivityGrid(): Promise<ProspectivityPointCollection> {
  return mockFetch(getProspectivityPointsGeoJSON());
}

export async function fetchMines(): Promise<MineCollection> {
  return mockFetch(getMinesGeoJSON());
}

export async function fetchGeology(): Promise<GeologyCollection> {
  return mockFetch(getGeologyGeoJSON());
}

export async function fetchLineaments(): Promise<LineamentCollection> {
  return mockFetch(getLineamentsGeoJSON());
}

export async function fetchRoads(): Promise<RoadCollection> {
  return mockFetch(getRoadsGeoJSON());
}
