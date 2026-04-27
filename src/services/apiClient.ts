import { fetchAuthSession } from 'aws-amplify/auth';
import { API_URL } from './awsConfig';

/**
 * Authenticated fetch wrapper. Adds the Cognito JWT id-token as a
 * Bearer authorization header so API Gateway's authorizer accepts the call.
 */
export async function apiFetch<T = unknown>(
  path: string,
  init: RequestInit = {},
): Promise<T> {
  const session = await fetchAuthSession();
  const token = session.tokens?.idToken?.toString();

  if (!token) {
    throw new Error('Not signed in');
  }

  const headers = new Headers(init.headers);
  headers.set('Authorization', `Bearer ${token}`);
  if (init.body && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  const res = await fetch(`${API_URL}${path}`, { ...init, headers });

  if (res.status === 204) return undefined as T;

  let body: unknown = null;
  try {
    body = await res.json();
  } catch {
    /* empty / non-json */
  }

  if (!res.ok) {
    const msg =
      (body as { error?: string } | null)?.error ?? `Request failed (${res.status})`;
    throw new Error(msg);
  }

  return body as T;
}
