
export const API_BASE_URL =
  (typeof import.meta !== 'undefined' && (import.meta as any).env?.VITE_API_BASE_URL) ||
  'https://setu.hetu.org';

export const API_VERSION = 'v1';
export const EXPLORER_PREFIX = `/api/${API_VERSION}/explorer`;
