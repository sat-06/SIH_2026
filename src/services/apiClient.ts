import { useAppStore } from '../store/useAppStore';

const MOCK_LATENCY_MS = 350;

export async function mockFetch<T>(data: T, customLatency?: number): Promise<T> {
  const simError = useAppStore.getState().simulateError;
  const latency = customLatency ?? MOCK_LATENCY_MS;

  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (simError) {
        reject(new Error('Simulated API Network Error (500 Internal Server Error)'));
      } else {
        resolve(data);
      }
    }, latency);
  });
}
