/**
 * POST /api/location/update
 * -------------------------
 * Called by the driver's phone browser every 15 seconds.
 * Body: { driverToken, lat, lng, status }
 * Auth: driverToken must match a valid job.
 */

export const prerender = false;

import type { APIContext } from 'astro';
import { getJobByDriverToken, updateJobLocation, type JobStatus } from '@/lib/jobs';

const VALID_STATUSES: JobStatus[] = ['assigned', 'en_route', 'arrived', 'in_progress', 'complete'];

// Simple in-memory rate limiter per driverToken (resets on Worker cold start — good enough for this scale)
const rlMap = new Map<string, { count: number; windowStart: number }>();
function checkRate(key: string, maxPerMin = 10): boolean {
  const now = Date.now();
  const entry = rlMap.get(key) ?? { count: 0, windowStart: now };
  if (now - entry.windowStart > 60_000) {
    rlMap.set(key, { count: 1, windowStart: now });
    return true;
  }
  if (entry.count >= maxPerMin) return false;
  entry.count++;
  rlMap.set(key, entry);
  return true;
}

export async function POST({ request, locals }: APIContext) {
  const env = (locals as any).runtime?.env;
  const kv = env?.JOBS;
  if (!kv) return new Response('Service unavailable', { status: 503 });

  let body: { driverToken?: string; lat?: number; lng?: number; status?: string };
  try {
    body = await request.json();
  } catch {
    return new Response('Bad JSON', { status: 400 });
  }

  const { driverToken, lat, lng, status } = body;

  if (!driverToken || typeof lat !== 'number' || typeof lng !== 'number' || !status) {
    return new Response('Missing fields: driverToken, lat, lng, status', { status: 400 });
  }

  if (!VALID_STATUSES.includes(status as JobStatus)) {
    return new Response(`Invalid status. Must be one of: ${VALID_STATUSES.join(', ')}`, { status: 400 });
  }

  if (!checkRate(driverToken)) {
    return new Response('Rate limit — max 10 updates/min', { status: 429 });
  }

  // Validate lat/lng bounds
  if (lat < 40 || lat > 50 || lng < -85 || lng > -70) {
    return new Response('Coordinates outside Ontario — check GPS', { status: 400 });
  }

  const job = await getJobByDriverToken(kv, driverToken);
  if (!job) {
    return new Response('Invalid or expired driver token', { status: 401 });
  }

  if (job.status === 'complete') {
    return new Response('Job already marked complete', { status: 409 });
  }

  await updateJobLocation(kv, job, lat, lng, status as JobStatus);

  return new Response(JSON.stringify({ ok: true, trackToken: job.trackToken }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
}
