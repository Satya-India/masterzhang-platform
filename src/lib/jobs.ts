/**
 * src/lib/jobs.ts
 * ---------------
 * Job / tracking data model for the Master Zhang GPS tracking system.
 * All data lives in Cloudflare KV (JOBS binding).
 *
 * Key schema:
 *   job:{trackToken}       → JobRecord (main record)
 *   jobs:index             → string[] of trackTokens (for admin listing)
 */

export type JobStatus =
  | 'pending'      // Quote received, no driver assigned yet
  | 'assigned'     // Driver assigned, not yet started
  | 'en_route'     // Driver on the way to customer
  | 'arrived'      // Driver arrived at location
  | 'in_progress'  // Job underway
  | 'complete';    // Job done

export interface JobRecord {
  trackToken: string;    // Customer-facing read token (UUID)
  driverToken: string;   // Driver-facing write token (UUID, rotated per job)
  jobId: string;         // Original quote reference
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  serviceType: string;   // 'moving' | 'cleanup' | 'snow' | 'yard'
  serviceAddress: string; // Postal code / address for the job pin
  scheduledAt: string;   // ISO datetime ('' = TBD)
  notes: string;
  // Assigned driver info (set by dispatcher)
  driverName: string;
  vehicleLabel: string;
  // Live location (updated by driver app)
  status: JobStatus;
  lat: number | null;
  lng: number | null;
  lastUpdated: string;   // ISO timestamp of last GPS ping
  createdAt: string;
}

/* ------------------------------------------------------------------ */
/* Crypto helpers                                                       */
/* ------------------------------------------------------------------ */

/** Generate a URL-safe UUID v4 token. */
export function generateToken(): string {
  return crypto.randomUUID();
}

/* ------------------------------------------------------------------ */
/* KV helpers                                                           */
/* ------------------------------------------------------------------ */

type KVNamespace = {
  get(key: string): Promise<string | null>;
  put(key: string, value: string, opts?: { expirationTtl?: number }): Promise<void>;
  delete(key: string): Promise<void>;
};

const JOB_TTL_SECONDS = 60 * 60 * 24 * 7; // 7 days
const INDEX_KEY = 'jobs:index';

export async function createJob(kv: KVNamespace, data: Omit<JobRecord, 'trackToken' | 'driverToken' | 'createdAt' | 'lastUpdated' | 'status' | 'lat' | 'lng'>): Promise<JobRecord> {
  const now = new Date().toISOString();
  const job: JobRecord = {
    ...data,
    trackToken: generateToken(),
    driverToken: generateToken(),
    status: 'pending',
    lat: null,
    lng: null,
    lastUpdated: now,
    createdAt: now,
  };

  // Store the job
  await kv.put(`job:${job.trackToken}`, JSON.stringify(job), { expirationTtl: JOB_TTL_SECONDS });

  // Update the index (best-effort — read-modify-write)
  const indexRaw = await kv.get(INDEX_KEY);
  const index: string[] = indexRaw ? JSON.parse(indexRaw) : [];
  index.unshift(job.trackToken); // newest first
  // Keep max 200 entries in index
  await kv.put(INDEX_KEY, JSON.stringify(index.slice(0, 200)));

  return job;
}

export async function getJobByTrackToken(kv: KVNamespace, trackToken: string): Promise<JobRecord | null> {
  const raw = await kv.get(`job:${trackToken}`);
  return raw ? (JSON.parse(raw) as JobRecord) : null;
}

export async function getJobByDriverToken(kv: KVNamespace, driverToken: string): Promise<JobRecord | null> {
  // We don't have a reverse index for driverToken, so we look up the token
  // stored as a companion key for performance.
  const trackTokenRaw = await kv.get(`driver:${driverToken}`);
  if (!trackTokenRaw) return null;
  return getJobByTrackToken(kv, trackTokenRaw);
}

export async function updateJobLocation(
  kv: KVNamespace,
  job: JobRecord,
  lat: number,
  lng: number,
  status: JobStatus,
): Promise<void> {
  const updated: JobRecord = {
    ...job,
    lat,
    lng,
    status,
    lastUpdated: new Date().toISOString(),
  };
  await kv.put(`job:${job.trackToken}`, JSON.stringify(updated), { expirationTtl: JOB_TTL_SECONDS });
}

export async function assignDriver(
  kv: KVNamespace,
  job: JobRecord,
  driverName: string,
  vehicleLabel: string,
): Promise<JobRecord> {
  const newDriverToken = generateToken();
  const updated: JobRecord = {
    ...job,
    driverName,
    vehicleLabel,
    driverToken: newDriverToken,
    status: 'assigned',
    lastUpdated: new Date().toISOString(),
  };
  // Store updated job
  await kv.put(`job:${job.trackToken}`, JSON.stringify(updated), { expirationTtl: JOB_TTL_SECONDS });
  // Store reverse lookup: driverToken → trackToken
  await kv.put(`driver:${newDriverToken}`, job.trackToken, { expirationTtl: JOB_TTL_SECONDS });
  return updated;
}

export async function listJobs(kv: KVNamespace): Promise<JobRecord[]> {
  const indexRaw = await kv.get(INDEX_KEY);
  if (!indexRaw) return [];
  const tokens: string[] = JSON.parse(indexRaw);
  const jobs = await Promise.all(tokens.map((t) => getJobByTrackToken(kv, t)));
  return jobs.filter((j): j is JobRecord => j !== null);
}

/** Human-readable status labels for both locales. */
export const STATUS_LABELS: Record<JobStatus, { en: string; zh: string; color: string }> = {
  pending:     { en: 'Awaiting dispatch',  zh: '等待调度',     color: 'text-ink-400' },
  assigned:    { en: 'Driver assigned',    zh: '司机已分配',   color: 'text-blue-400' },
  en_route:    { en: 'Driver en route',    zh: '司机正在前往', color: 'text-amber-400' },
  arrived:     { en: 'Driver arrived',     zh: '司机已到达',   color: 'text-copper-400' },
  in_progress: { en: 'Job in progress',    zh: '正在服务',     color: 'text-green-400' },
  complete:    { en: 'Job complete ✓',     zh: '服务完成 ✓',   color: 'text-green-300' },
};

/** Known drivers — stored here for the MVP, move to KV/DB later. */
export const DRIVERS = [
  { id: 'd1', name: 'Zhang Wei (张伟)', vehicle: 'Truck 1 — White GMC' },
  { id: 'd2', name: 'Li Ming (李明)',   vehicle: 'Van 1 — Blue Transit' },
  { id: 'd3', name: 'Wang Fang (王芳)', vehicle: 'Truck 2 — Black F-150' },
];
