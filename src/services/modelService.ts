import { mockFetch } from './apiClient';
import { getModelPerformance, GROUND_TRUTH_RECORDS, MODEL_VERSION_HISTORY } from '../mocks/seed';
import { ModelPerformanceMetrics, GroundTruthRecord, ModelVersionHistory } from '../types/domain';

export async function fetchModelPerformance(modelId: 'rf' | 'xgb' | 'cnn' | 'fusion' = 'fusion'): Promise<ModelPerformanceMetrics> {
  return mockFetch(getModelPerformance(modelId));
}

export async function fetchGroundTruthRecords(): Promise<GroundTruthRecord[]> {
  return mockFetch(GROUND_TRUTH_RECORDS);
}

export async function fetchModelVersionHistory(): Promise<ModelVersionHistory[]> {
  return mockFetch(MODEL_VERSION_HISTORY);
}
