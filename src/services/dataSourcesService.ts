import { mockFetch } from './apiClient';
import { DATA_SOURCES, SYSTEM_SERVICES_STATUS } from '../mocks/seed';
import { DataSourceItem, SystemServiceStatus } from '../types/domain';

export async function fetchDataSources(): Promise<DataSourceItem[]> {
  return mockFetch(DATA_SOURCES);
}

export async function fetchSystemStatus(): Promise<SystemServiceStatus[]> {
  return mockFetch(SYSTEM_SERVICES_STATUS);
}
