import { get } from './client';
import type {
  ExplorerStatsResponse,
  AnchorsResponse,
  AnchorDetailResponse,
  EventsResponse,
  EventDetailResponse,
  AccountResponse,
  ValidatorsResponse,
  SolversResponse,
  SearchResponse,
  DagLiveResponse,
  DagPathResponse,
} from './types';


export function fetchExplorerStats(): Promise<ExplorerStatsResponse> {
  return get<ExplorerStatsResponse>('/stats');
}


export function fetchAnchors(params?: { page?: number; limit?: number }): Promise<AnchorsResponse> {
  const sp = new URLSearchParams();
  if (params?.page != null) sp.set('page', String(params.page));
  if (params?.limit != null) sp.set('limit', String(params.limit));
  const q = sp.toString();
  return get<AnchorsResponse>(`/anchors${q ? `?${q}` : ''}`);
}


export function fetchAnchor(anchorId: string): Promise<AnchorDetailResponse> {
  return get<AnchorDetailResponse>(`/anchor/${encodeURIComponent(anchorId)}`);
}


export function fetchEvents(params?: {
  page?: number;
  limit?: number;
  type?: string;
  status?: string;
  creator?: string;
}): Promise<EventsResponse> {
  const sp = new URLSearchParams();
  if (params?.page != null) sp.set('page', String(params.page));
  if (params?.limit != null) sp.set('limit', String(params.limit));
  if (params?.type) sp.set('type', params.type);
  if (params?.status) sp.set('status', params.status);
  if (params?.creator) sp.set('creator', params.creator);
  const q = sp.toString();
  return get<EventsResponse>(`/events${q ? `?${q}` : ''}`);
}


export function fetchEvent(eventId: string): Promise<EventDetailResponse> {
  return get<EventDetailResponse>(`/event/${encodeURIComponent(eventId)}`);
}


export function fetchAccount(address: string): Promise<AccountResponse> {
  return get<AccountResponse>(`/account/${encodeURIComponent(address)}`);
}


export function fetchValidators(): Promise<ValidatorsResponse> {
  return get<ValidatorsResponse>('/validators');
}


export function fetchSolvers(): Promise<SolversResponse> {
  return get<SolversResponse>('/solvers');
}


export function fetchSearch(q: string): Promise<SearchResponse> {
  return get<SearchResponse>(`/search?q=${encodeURIComponent(q)}`);
}


export function fetchDagLive(params?: {
  anchor_id?: string;
  limit?: number;
  since_event_id?: string;
}): Promise<DagLiveResponse> {
  const sp = new URLSearchParams();
  if (params?.anchor_id) sp.set('anchor_id', params.anchor_id);
  if (params?.limit != null) sp.set('limit', String(params.limit));
  if (params?.since_event_id) sp.set('since_event_id', params.since_event_id);
  const q = sp.toString();
  return get<DagLiveResponse>(`/dag/live${q ? `?${q}` : ''}`);
}


export function fetchDagPath(eventId: string): Promise<DagPathResponse> {
  return get<DagPathResponse>(`/dag/path/${encodeURIComponent(eventId)}`);
}
