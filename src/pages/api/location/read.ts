/**
 * GET /api/location/read?t={trackToken}
 * --------------------------------------
 * Polled by the customer tracking page every 10 seconds.
 * Returns only the public-safe fields (no driverToken exposed).
 */

export const prerender = false;

import type { APIContext } from 'astro';
import { getJobByTrackToken, STATUS_LABELS } from '@/lib/jobs';

const CORS = {
  'Content-Type': 'application/json',
  'Cache-Control': 'no-store',
  'Access-Control-Allow-Origin': '*',
};

export async function GET({ url, locals }: APIContext) {
  const env = (locals as any).runtime?.env;
  const kv = env?.JOBS;
  if (!kv) return new Response('Service unavailable', { status: 503, headers: CORS });

  const trackToken = url.searchParams.get('t');
  if (!trackToken || trackToken.length < 30) {
    return new Response(JSON.stringify({ error: 'Missing or invalid token' }), { status: 400, headers: CORS });
  }

  const job = await getJobByTrackToken(kv, trackToken);
  if (!job) {
    return new Response(JSON.stringify({ error: 'Tracking link not found or expired' }), { status: 404, headers: CORS });
  }

  const label = STATUS_LABELS[job.status];

  const payload = {
    status: job.status,
    statusEn: label.en,
    statusZh: label.zh,
    statusColor: label.color,
    driverName: job.driverName || null,
    vehicleLabel: job.vehicleLabel || null,
    serviceType: job.serviceType,
    serviceAddress: job.serviceAddress,
    lat: job.lat,
    lng: job.lng,
    lastUpdated: job.lastUpdated,
    scheduledAt: job.scheduledAt,
  };

  return new Response(JSON.stringify(payload), { status: 200, headers: CORS });
}
