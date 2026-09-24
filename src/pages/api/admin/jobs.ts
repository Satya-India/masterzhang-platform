/**
 * GET /api/admin/jobs
 * -------------------
 * Returns all jobs from KV for the admin dispatch page.
 * Auth: requires valid admin session cookie.
 */

export const prerender = false;

import type { APIContext } from 'astro';
import { listJobs } from '@/lib/jobs';

const COOKIE_NAME = 'mz_admin';

function isAuthenticated(request: Request, adminPassword: string): boolean {
  const cookies = request.headers.get('Cookie') ?? '';
  const match = cookies.match(new RegExp(`${COOKIE_NAME}=([^;]+)`));
  if (!match) return false;
  try {
    const decoded = atob(match[1]);
    return decoded.includes(`:${adminPassword.slice(0, 8)}`);
  } catch {
    return false;
  }
}

export async function GET({ request, locals }: APIContext) {
  const env = (locals as any).runtime?.env;
  const kv = env?.JOBS;
  const adminPassword: string = env?.ADMIN_PASSWORD ?? '';

  if (!kv) return new Response('Service unavailable', { status: 503 });
  if (!isAuthenticated(request, adminPassword)) {
    return new Response('Unauthorized', { status: 401 });
  }

  const jobs = await listJobs(kv);

  // Strip driverToken from the response for safety
  const safe = jobs.map(({ driverToken: _dt, ...rest }) => rest);

  return new Response(JSON.stringify(safe), {
    status: 200,
    headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' },
  });
}
