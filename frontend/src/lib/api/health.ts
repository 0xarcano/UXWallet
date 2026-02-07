import type { HealthResponse } from '@/types/health';
import { apiGet } from './client';

export function getHealth(): Promise<HealthResponse> {
  return apiGet<HealthResponse>('/api/health');
}
