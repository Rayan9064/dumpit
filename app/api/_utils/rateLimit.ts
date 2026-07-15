import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';
import { NextRequest, NextResponse } from 'next/server';

// ---------------------------------------------------------------------------
// Upstash Redis client
// Requires env vars: UPSTASH_REDIS_REST_URL + UPSTASH_REDIS_REST_TOKEN
// ---------------------------------------------------------------------------
function getRedis(): Redis | null {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) return null;
  return new Redis({ url, token });
}

// ---------------------------------------------------------------------------
// Rate limiters (created lazily; only when Redis credentials are present)
// ---------------------------------------------------------------------------
let _authenticatedLimiter: Ratelimit | null = null;
let _publicLimiter: Ratelimit | null = null;
let _aiLimiter: Ratelimit | null = null;

function getAuthenticatedLimiter(): Ratelimit | null {
  if (_authenticatedLimiter) return _authenticatedLimiter;
  const redis = getRedis();
  if (!redis) return null;
  _authenticatedLimiter = new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(60, '1 m'), // 60 req/min for authenticated users
    prefix: 'rl:auth',
    analytics: false,
  });
  return _authenticatedLimiter;
}

function getPublicLimiter(): Ratelimit | null {
  if (_publicLimiter) return _publicLimiter;
  const redis = getRedis();
  if (!redis) return null;
  _publicLimiter = new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(20, '1 m'), // 20 req/min for public/anonymous
    prefix: 'rl:public',
    analytics: false,
  });
  return _publicLimiter;
}

function getAiLimiter(): Ratelimit | null {
  if (_aiLimiter) return _aiLimiter;
  const redis = getRedis();
  if (!redis) return null;
  _aiLimiter = new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(10, '1 m'), // 10 req/min for AI endpoints
    prefix: 'rl:ai',
    analytics: false,
  });
  return _aiLimiter;
}

// ---------------------------------------------------------------------------
// Identifier helpers
// ---------------------------------------------------------------------------
function getClientIp(request: NextRequest): string {
  return (
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    request.headers.get('x-real-ip') ||
    'unknown'
  );
}

// ---------------------------------------------------------------------------
// Rate-limit check helpers
// Returns a 429 NextResponse when limit is exceeded, null otherwise.
// If Redis is not configured, rate limiting is silently skipped (fail-open).
// ---------------------------------------------------------------------------

export async function checkAuthenticatedRateLimit(
  _request: NextRequest,
  userId: string,
): Promise<NextResponse | null> {
  const limiter = getAuthenticatedLimiter();
  if (!limiter) return null; // Redis not configured – skip

  const { success, limit, remaining, reset } = await limiter.limit(userId);
  if (success) return null;

  return NextResponse.json(
    { error: 'Too many requests. Please slow down.' },
    {
      status: 429,
      headers: {
        'X-RateLimit-Limit': String(limit),
        'X-RateLimit-Remaining': String(remaining),
        'X-RateLimit-Reset': String(reset),
        'Retry-After': String(Math.ceil((reset - Date.now()) / 1000)),
      },
    },
  );
}

export async function checkPublicRateLimit(
  request: NextRequest,
): Promise<NextResponse | null> {
  const limiter = getPublicLimiter();
  if (!limiter) return null;

  const ip = getClientIp(request);
  const { success, limit, remaining, reset } = await limiter.limit(ip);
  if (success) return null;

  return NextResponse.json(
    { error: 'Too many requests. Please slow down.' },
    {
      status: 429,
      headers: {
        'X-RateLimit-Limit': String(limit),
        'X-RateLimit-Remaining': String(remaining),
        'X-RateLimit-Reset': String(reset),
        'Retry-After': String(Math.ceil((reset - Date.now()) / 1000)),
      },
    },
  );
}

export async function checkAiRateLimit(
  _request: NextRequest,
  userId: string,
): Promise<NextResponse | null> {
  const limiter = getAiLimiter();
  if (!limiter) return null;

  const { success, limit, remaining, reset } = await limiter.limit(userId);
  if (success) return null;

  return NextResponse.json(
    { error: 'AI rate limit exceeded. Please wait before sending another query.' },
    {
      status: 429,
      headers: {
        'X-RateLimit-Limit': String(limit),
        'X-RateLimit-Remaining': String(remaining),
        'X-RateLimit-Reset': String(reset),
        'Retry-After': String(Math.ceil((reset - Date.now()) / 1000)),
      },
    },
  );
}
