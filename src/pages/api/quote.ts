export const prerender = false;

import type { APIRoute } from 'astro';
import { z } from 'zod';
import { createJob } from '@/lib/jobs';


/* ------------------------------------------------------------------ */
/* Schema — mirrors the estimator's server-side pricing table          */
/* ------------------------------------------------------------------ */

const SERVICES = ['moving', 'cleanup', 'snow', 'yard'] as const;

const VOLUMES: Record<(typeof SERVICES)[number], string[]> = {
  moving: ['1', '2', '3', '4'],
  /** cleanup = combined move-in/move-out clean + junk haul-away, priced by bedroom */
  cleanup: ['1', '2', '3', '4'],
  snow: ['small', 'medium', 'large', 'commercial'],
  /** yard: 'plan' returns null (custom proposal) */
  yard: ['small', 'medium', 'large', 'plan'],
};

/** York Region FSAs (Markham, Richmond Hill, Vaughan, Thornhill, Unionville) */
const YORK_REGION_FSAS = new Set([
  'L3P', 'L3R', 'L3S', 'L3T', 'L3X',
  'L4B', 'L4C', 'L4E', 'L4H', 'L4J', 'L4K', 'L4L', 'L4S',
  'L6A', 'L6B', 'L6C', 'L6E', 'L6G',
]);

const quoteSchema = z.object({
  service: z.enum(SERVICES),
  volume: z.string().min(1).max(16),
  postalCode: z
    .string()
    .trim()
    .regex(/^[A-Za-z]\d[A-Za-z][ -]?\d[A-Za-z]\d$/, 'Invalid Canadian postal code')
    .transform((v) => v.toUpperCase().replace(/\s/g, '')),
  name: z.string().trim().min(1).max(120),
  email: z.string().trim().email().max(200),
  phone: z.string().trim().regex(/^[+()\-.\s\d]{7,20}$/, 'Invalid phone number'),
  notes: z.string().trim().max(2000).optional().default(''),
  /** Honeypot — must be empty for humans */
  companyWebsite: z.string().optional().default(''),
  locale: z.enum(['en', 'zh']).optional().default('en'),
  priceLow: z.number().nonnegative().optional().nullable(),
  priceHigh: z.number().nonnegative().optional().nullable(),
});

/** Re-derive the ballpark on the server — never trust client-computed prices. */
function ballpark(service: string, volume: string): [number, number] | null {
  const R: Record<string, Record<string, [number, number]>> = {
    moving:  { '1': [395, 480], '2': [560, 680], '3': [720, 880], '4': [880, 1150] },
    /** cleanup = move-in/out deep clean + junk haul-away combined, priced by bedroom count */
    cleanup: { '1': [350, 450], '2': [460, 600], '3': [580, 760], '4': [740, 980] },
    snow:    { small: [420, 560], medium: [560, 780], large: [780, 1020] },
    /** yard 'plan' (annual contract) → no price chip, returns null → "Custom proposal" */
    yard:    { small: [250, 340], medium: [340, 480], large: [480, 720] },
  };
  return R[service]?.[volume] ?? null;
}

/* Per-isolate rate limiter: 10 req/min/IP. Bind Cloudflare KV for global limits. */
const hits = new Map<string, { count: number; reset: number }>();
const RATE_LIMIT = 10;
const WINDOW_MS = 60_000;

function rateLimited(ip: string): boolean {
  const now = Date.now();
  const entry = hits.get(ip);
  if (!entry || now > entry.reset) {
    hits.set(ip, { count: 1, reset: now + WINDOW_MS });
    return false;
  }
  entry.count += 1;
  return entry.count > RATE_LIMIT;
}

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' },
  });

export const POST: APIRoute = async ({ request, locals }) => {
  // Cloudflare runtime env (works on Pages and via the dev platformProxy)
  const env = (locals as any)?.runtime?.env ?? {};
  const SITE_URL = env.PUBLIC_SITE_URL ?? 'https://nexuscare.ca';

  /* ---- Guards ---- */
  const ip =
    request.headers.get('cf-connecting-ip') ??
    request.headers.get('x-forwarded-for')?.split(',')[0].trim() ??
    'unknown';
  if (rateLimited(ip)) return json({ ok: false, error: 'rate_limited' }, 429);

  /* ---- Same-origin check ---- */
  const origin = request.headers.get('origin');
  if (origin) {
    const siteHost = new URL(SITE_URL).hostname;
    const reqHost = new URL(request.url).hostname;
    if (!origin.includes(siteHost) && !origin.includes(reqHost)) {
      return json({ ok: false, error: 'forbidden_origin' }, 403);
    }
  }

  /* ---- Parse + honeypot (cheap bot exit, fake success) ---- */
  let raw: Record<string, unknown>;
  try {
    raw = await request.json();
  } catch {
    return json({ ok: false, error: 'invalid_json' }, 400);
  }
  if (typeof raw.companyWebsite === 'string' && raw.companyWebsite.trim() !== '') {
    return json({ ok: true, id: 'discarded' });
  }

  /* ---- Validate ---- */
  const parsed = quoteSchema.safeParse(raw);
  if (!parsed.success) {
    return json(
      { ok: false, error: 'validation_failed', issues: parsed.error.flatten().fieldErrors },
      422,
    );
  }
  const q = parsed.data;

  if (!VOLUMES[q.service].includes(q.volume)) {
    return json({ ok: false, error: 'validation_failed', issues: { volume: ['unknown'] } }, 422);
  }

  const range = ballpark(q.service, q.volume);
  const fsa = q.postalCode.slice(0, 3);
  const inRegion = YORK_REGION_FSAS.has(fsa);
  const quoteId = `Q-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`.toUpperCase();

  const payload = {
    id: quoteId,
    receivedAt: new Date().toISOString(),
    service: q.service,
    volume: q.volume,
    priceRange: range ? `$${range[0]} – $${range[1]} CAD` : 'Custom proposal',
    clientReportedRange: q.priceLow && q.priceHigh ? `$${q.priceLow} – $${q.priceHigh} CAD` : null,
    inServiceRegion: inRegion,
    postalCode: q.postalCode,
    contact: { name: q.name, email: q.email, phone: q.phone },
    notes: q.notes,
    locale: q.locale,
    sourceIp: ip,
  };

  /* ---- Create job tracking record in KV (best-effort) ---- */
  let trackToken: string | null = null;
  const kv = env.JOBS;
  if (kv) {
    try {
      const job = await createJob(kv, {
        jobId: quoteId,
        customerName: q.name,
        customerEmail: q.email,
        customerPhone: q.phone,
        serviceType: q.service,
        serviceAddress: q.postalCode,
        scheduledAt: '',
        notes: q.notes ?? '',
        driverName: '',
        vehicleLabel: '',
      });
      trackToken = job.trackToken;
    } catch (err) {
      console.error('job_create_failed', err);
    }
  }

  const adminUrl = `${SITE_URL}/admin/dispatch`;
  const trackUrl = trackToken ? `${SITE_URL}/track/${trackToken}` : null;

  /* ---- Dispatch 1: generic webhook (Slack / Discord / Make / Zapier) ---- */
  if (env.QUOTE_WEBHOOK_URL) {
    try {
      await fetch(env.QUOTE_WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: `🔔 New quote ${payload.id} — ${q.service}/${q.volume} — ${q.postalCode}${inRegion ? '' : ' (OUT OF REGION)'}\n📋 Dispatch: ${adminUrl}${trackUrl ? `\n📍 Track: ${trackUrl}` : ''}`,
          ...payload,
          trackUrl,
          adminUrl,
        }),
      });
    } catch (err) {
      console.error('webhook_dispatch_failed', err);
    }
  }

  /* ---- Dispatch 2: Resend transactional email ---- */
  if (env.RESEND_API_KEY && env.QUOTE_DESTINATION_EMAIL) {
    try {
      await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${env.RESEND_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          // TODO: change to 'quotes@nexuscare.ca' once nexuscare.ca is verified in Resend dashboard
          from: 'Nexus Care Quotes <onboarding@resend.dev>',
          to: [env.QUOTE_DESTINATION_EMAIL],
          subject: `[${payload.id}] ${q.service} quote — ${q.postalCode}${inRegion ? '' : ' (OUT OF REGION)'}`,
          text: [
            JSON.stringify(payload, null, 2),
            '',
            '--- DISPATCH ---',
            `Admin dashboard: ${adminUrl}`,
            trackUrl ? `Customer tracking URL: ${trackUrl}` : '',
          ].join('\n'),
        }),
      });
    } catch (err) {
      console.error('resend_dispatch_failed', err);
    }
  }

  /* Always 200 to the client even if a dispatcher failed — payload is
     recoverable from logs. */
  return json({ ok: true, id: quoteId, inServiceRegion: inRegion, priceRange: payload.priceRange });
};

export const ALL: APIRoute = () => json({ ok: false, error: 'method_not_allowed' }, 405);


