import { describe, expect, it } from 'vitest';
import { NextRequest } from 'next/server';
import { getBearerToken } from './auth';

const makeRequest = (authorization?: string) => new NextRequest('https://dumpit.test/api', {
  headers: authorization ? { authorization } : {},
});

describe('getBearerToken', () => {
  it('extracts a bearer token from the authorization header', () => {
    expect(getBearerToken(makeRequest('Bearer test-token'))).toBe('test-token');
  });

  it('returns null for missing or malformed authorization headers', () => {
    expect(getBearerToken(makeRequest())).toBeNull();
    expect(getBearerToken(makeRequest('Basic test-token'))).toBeNull();
    expect(getBearerToken(makeRequest('Bearer '))).toBeNull();
  });
});
