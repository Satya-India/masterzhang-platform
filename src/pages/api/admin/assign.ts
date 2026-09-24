/**
 * POST /api/admin/assign
 * ----------------------
 * Dispatcher assigns a driver to a pending job.
 * Body: { trackToken, driverIndex } (driverIndex references DRIVERS array)
 * Auth: requires valid admin session cookie.
 */

export const prerender = false;

import type { APIContext } from 'astro';
import { getJobByTrackToken, assignDriver, DRIVERS } from '@/lib/jobs';

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

export async function POST({ request, locals }: APIContext) {
  const env = (locals as any).runtime?.env;
  const kv = env?.JOBS;
  const adminPassword: string = env?.ADMIN_PASSWORD ?? '';

  if (!kv) return new Response('Service unavailable', { status: 503 });
  if (!isAuthenticated(request, adminPassword)) {
    return new Response('Unauthorized', { status: 401 });
  }

  let body: { trackToken?: string; driverIndex?: number };
  try {
    body = await request.json();
  } catch {
    return new Response('Bad JSON', { status: 400 });
  }

  const { trackToken, driverIndex } = body;
  if (!trackToken || driverIndex === undefined) {
    return new Response('Missing trackToken or driverIndex', { status: 400 });
  }

  const driver = DRIVERS[driverIndex];
  if (!driver) {
    return new Response('Invalid driverIndex', { status: 400 });
  }

  const job = await getJobByTrackToken(kv, trackToken);
  if (!job) {
    return new Response('Job not found', { status: 404 });
  }

  const updated = await assignDriver(kv, job, driver.name, driver.vehicle);

  // Return the driver URL so the dispatcher can copy-paste it to the driver
  const driverUrl = `/driver/${updated.driverToken}`;
  const trackUrl = `/track/${updated.trackToken}`;

  return new Response(
    JSON.stringify({
      ok: true,
      driverUrl,
      trackUrl,
      driverName: driver.name,
      vehicle: driver.vehicle,
    }),
    { status: 200, headers: { 'Content-Type': 'application/json' } },
  );
}
