import { http, HttpResponse } from 'msw';

export const handlers = [
  http.get('http://localhost:3000/health', () => {
    return HttpResponse.json({ status: 'ok' });
  }),
];
