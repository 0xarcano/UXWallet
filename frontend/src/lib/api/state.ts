import type { GetChannelResponse, GetSessionsResponse } from '@/types/state';
import { apiGet } from './client';

export function getChannel(channelId: string): Promise<GetChannelResponse> {
  return apiGet<GetChannelResponse>(`/api/state/channel/${channelId}`);
}

export function getSessions(userAddress: string): Promise<GetSessionsResponse> {
  return apiGet<GetSessionsResponse>('/api/state/sessions', { userAddress });
}
