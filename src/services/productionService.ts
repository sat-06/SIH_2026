import { mockFetch } from './apiClient';
import { getProductionData, SHORTFALL_DRIVERS } from '../mocks/seed';
import { ProductionForecastResponse, ShortfallDriver } from '../types/domain';

export async function fetchProductionForecast(horizon: 3 | 6 | 12 = 12): Promise<ProductionForecastResponse> {
  return mockFetch(getProductionData(horizon));
}

export async function fetchShortfallDrivers(): Promise<ShortfallDriver[]> {
  return mockFetch(SHORTFALL_DRIVERS);
}
