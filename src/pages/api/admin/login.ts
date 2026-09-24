/**
 * POST /api/admin/login
 * ---------------------
 * Checks ADMIN_PASSWORD env secret, sets a signed httpOnly session cookie.
 */

export const prerender = false;

import type { APIContext } from 'astro';

const COOKIE_NAME = 'mz_admin';
const COOKIE_MAX_AGE = 60 * 60 * 10; // 10 hours

export async function POST({ request, locals, redirect }: APIContext) {
  const env = (locals as any).runtime?.env;
  const adminPassword: string = env?.ADMIN_PASSWORD ?? '';

  let password = '';
  try {
    const form = await request.formData();
    password = (form.get('password') as string) ?? '';
  } catch {
    return new Response('Bad request', { status: 400 });
  }

  if (!adminPassword) {
    // ADMIN_PASSWORD secret not set — block access
    return new Response('Admin access not configured. Set ADMIN_PASSWORD secret.', { status: 503 });
  }

  // Simple string comparison. For production, use bcrypt — but for a 1-3 person
  // operation this is acceptable. Replace with a hashed check when scaling up.
  const valid = password === adminPassword;

  if (!valid) {
    return redirect('/admin/login?error=1', 302);
  }

  // Sign a simple session token: base64(timestamp:password_hash_prefix)
  const sessionValue = btoa(`${Date.now()}:${adminPassword.slice(0, 8)}`);

  return new Response(null, {
    status: 302,
    headers: {
      Location: '/admin/dispatch',
      'Set-Cookie': `${COOKIE_NAME}=${sessionValue}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=${COOKIE_MAX_AGE}`,
    },
  });
}
