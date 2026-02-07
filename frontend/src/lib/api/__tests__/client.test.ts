import { server } from '@/test/msw/server';
import { http, HttpResponse } from 'msw';
import { apiGet, apiPost, ApiClientError } from '../client';

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe('apiGet', () => {
  it('returns parsed JSON on success', async () => {
    server.use(
      http.get('*/api/test', () => {
        return HttpResponse.json({ data: 'hello' });
      }),
    );

    const result = await apiGet<{ data: string }>('/api/test');
    expect(result.data).toBe('hello');
  });

  it('appends query params to URL', async () => {
    server.use(
      http.get('*/api/test', ({ request }) => {
        const url = new URL(request.url);
        return HttpResponse.json({ q: url.searchParams.get('foo') });
      }),
    );

    const result = await apiGet<{ q: string }>('/api/test', { foo: 'bar' });
    expect(result.q).toBe('bar');
  });

  it('throws ApiClientError on error response', async () => {
    server.use(
      http.get('*/api/test', () => {
        return HttpResponse.json(
          { error: { code: 'NOT_FOUND', message: 'Not found' } },
          { status: 404 },
        );
      }),
    );

    await expect(apiGet('/api/test')).rejects.toThrow(ApiClientError);
    try {
      await apiGet('/api/test');
    } catch (e) {
      const err = e as ApiClientError;
      expect(err.code).toBe('NOT_FOUND');
      expect(err.status).toBe(404);
    }
  });

  it('handles 429 with RATE_LIMITED code', async () => {
    server.use(
      http.get('*/api/test', () => {
        return new HttpResponse(null, {
          status: 429,
          headers: { 'Retry-After': '30' },
        });
      }),
    );

    try {
      await apiGet('/api/test');
    } catch (e) {
      const err = e as ApiClientError;
      expect(err.code).toBe('RATE_LIMITED');
      expect(err.status).toBe(429);
      expect(err.details).toEqual({ retryAfter: 30 });
    }
  });

  it('handles non-JSON error responses', async () => {
    server.use(
      http.get('*/api/test', () => {
        return new HttpResponse('Internal Server Error', { status: 500 });
      }),
    );

    await expect(apiGet('/api/test')).rejects.toThrow(ApiClientError);
    try {
      await apiGet('/api/test');
    } catch (e) {
      const err = e as ApiClientError;
      expect(err.code).toBe('UNKNOWN');
      expect(err.status).toBe(500);
    }
  });
});

describe('apiPost', () => {
  it('sends JSON body and returns parsed response', async () => {
    server.use(
      http.post('*/api/test', async ({ request }) => {
        const body = (await request.json()) as { name: string };
        return HttpResponse.json({ echo: body.name });
      }),
    );

    const result = await apiPost<{ echo: string }>('/api/test', { name: 'test' });
    expect(result.echo).toBe('test');
  });

  it('sends POST without body', async () => {
    server.use(
      http.post('*/api/test', () => {
        return HttpResponse.json({ ok: true });
      }),
    );

    const result = await apiPost<{ ok: boolean }>('/api/test');
    expect(result.ok).toBe(true);
  });

  it('throws ApiClientError on error response', async () => {
    server.use(
      http.post('*/api/test', () => {
        return HttpResponse.json(
          { error: { code: 'VALIDATION_ERROR', message: 'Bad input', details: { field: 'name' } } },
          { status: 400 },
        );
      }),
    );

    try {
      await apiPost('/api/test', { name: '' });
    } catch (e) {
      const err = e as ApiClientError;
      expect(err.code).toBe('VALIDATION_ERROR');
      expect(err.status).toBe(400);
      expect(err.details).toEqual({ field: 'name' });
    }
  });
});
