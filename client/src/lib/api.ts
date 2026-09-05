import axios, { AxiosError } from 'axios';

// Single JSON API surface. Credentials are sent as HTTP-only cookies; we never
// store tokens in localStorage.
// VITE_API_URL overrides the target; otherwise production builds default to the
// deployed Render API (no proxy exists on static hosts) and dev uses the Vite
// proxy (/api/v1 -> localhost:4000).
const baseURL =
  import.meta.env.VITE_API_URL ||
  (import.meta.env.PROD ? 'https://duka-stock-api.onrender.com' : '/api/v1');

export const api = axios.create({
  baseURL,
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' },
});

export interface ApiError {
  code: string;
  message: string;
  details?: unknown;
}

// Normalizes backend and transport errors into a friendly { code, message }.
export function extractError(err: unknown): ApiError {
  if (axios.isAxiosError(err)) {
    const body = err.response?.data as {
      error?: ApiError;
      message?: string;
    };
    if (body?.error) return body.error;
    if (typeof body?.message === 'string') return { code: 'ERROR', message: body.message };
    if (err.response?.status === 401) return { code: 'UNAUTHORIZED', message: 'You have been logged out. Please sign in again.' };
    if (err.response?.status === 403) return { code: 'FORBIDDEN', message: 'You do not have permission to do that.' };
    if (!err.response) return { code: 'NETWORK', message: 'Could not reach the server. Check your connection.' };
    if (err.response?.status === 409) return { code: 'CONFLICT', message: 'That operation conflicts with existing data.' };
  }
  return { code: 'ERROR', message: err instanceof Error ? err.message : 'Something went wrong.' };
}

// A typed filter that lets queries declare their return shape.
export function isAxiosError(err: unknown): err is AxiosError {
  return axios.isAxiosError(err);
}
