export interface HealthResponse {
  status: 'healthy' | 'degraded';
  timestamp: string;
  checks: {
    postgres: string;
    redis: string;
  };
}
