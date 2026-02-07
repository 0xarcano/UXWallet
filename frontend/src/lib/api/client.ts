import { env } from '@/config/env';
import type { ApiError } from '@/types/api';

export class ApiClientError extends Error {
  constructor(
    public code: string,
    message: string,
    public status: number,
    public details?: Record<string, unknown>,
  ) {
    super(message);
    this.name = 'ApiClientError';
  }
}

const BASE_URL = env.EXPO_PUBLIC_API_URL;

async function handleResponse<T>(response: Response): Promise<T> {
  if (response.status === 429) {
    const retryAfter = response.headers.get('Retry-After');
    throw new ApiClientError(
      'RATE_LIMITED',
      `Too many requests. Retry after ${retryAfter ?? 'a few'} seconds.`,
      429,
      retryAfter ? { retryAfter: Number(retryAfter) } : undefined,
    );
  }

  if (!response.ok) {
    let errorData: ApiError | undefined;
    try {
      errorData = (await response.json()) as ApiError;
    } catch {
      // Response body is not JSON
    }

    if (errorData?.error) {
      throw new ApiClientError(
        errorData.error.code,
        errorData.error.message,
        response.status,
        errorData.error.details,
      );
    }

    throw new ApiClientError('UNKNOWN', response.statusText || 'Request failed', response.status);
  }

  return response.json() as Promise<T>;
}

export async function apiGet<T>(
  path: string,
  params?: Record<string, string>,
): Promise<T> {
  const url = new URL(path, BASE_URL);
  if (params) {
    for (const [key, value] of Object.entries(params)) {
      url.searchParams.set(key, value);
    }
  }

  const response = await fetch(url.toString(), {
    method: 'GET',
    headers: {
      'X-Request-Id': crypto.randomUUID(),
    },
  });

  return handleResponse<T>(response);
}

export async function apiPost<T>(
  path: string,
  body?: unknown,
): Promise<T> {
  const url = new URL(path, BASE_URL);

  const response = await fetch(url.toString(), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Request-Id': crypto.randomUUID(),
    },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  return handleResponse<T>(response);
}
