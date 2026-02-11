import { API_BASE_URL, EXPLORER_PREFIX } from './config';
import type { ApiErrorResponse } from './types';

const BASE = `${API_BASE_URL}${EXPLORER_PREFIX}`;

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public body?: ApiErrorResponse
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export async function request<T>(
  path: string,
  options?: RequestInit
): Promise<T> {
  const url = path.startsWith('http') ? path : `${BASE}${path}`;
  const res = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  });

  const ct = res.headers.get('content-type');
  const isJson = ct?.includes('application/json');

  let data: unknown = undefined;
  if (isJson) {
    try {
      data = await res.json();
    } catch {
      // ignore
    }
  }

  if (!res.ok) {
    const err = data as ApiErrorResponse | undefined;
    const msg = err?.message ?? err?.error ?? res.statusText;
    throw new ApiError(msg || `HTTP ${res.status}`, res.status, err);
  }

  if (res.status === 204 || res.headers.get('content-length') === '0') {
    return undefined as T;
  }

  return (data as T) ?? (undefined as T);
}

export function get<T>(path: string): Promise<T> {
  return request<T>(path, { method: 'GET' });
}
