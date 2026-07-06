import { describe, expect, it } from 'vitest';
import { isAuthorizedChunk, normalizeSearchMode } from './aiSearch';

describe('normalizeSearchMode', () => {
  it('accepts known search modes and defaults to all', () => {
    expect(normalizeSearchMode('mine')).toBe('mine');
    expect(normalizeSearchMode('shared')).toBe('shared');
    expect(normalizeSearchMode('all')).toBe('all');
    expect(normalizeSearchMode('unknown')).toBe('all');
  });
});

describe('isAuthorizedChunk', () => {
  it('filters chunks by search mode', () => {
    expect(isAuthorizedChunk({ user_id: 'user-a', is_public: false }, 'user-a', 'mine')).toBe(true);
    expect(isAuthorizedChunk({ user_id: 'user-b', is_public: false }, 'user-a', 'mine')).toBe(false);
    expect(isAuthorizedChunk({ user_id: 'user-b', is_public: true }, 'user-a', 'shared')).toBe(true);
    expect(isAuthorizedChunk({ user_id: 'user-a', is_public: true }, 'user-a', 'shared')).toBe(false);
    expect(isAuthorizedChunk({ user_id: 'user-b', is_public: false }, 'user-a', 'all')).toBe(false);
    expect(isAuthorizedChunk({ user_id: 'user-b', is_public: true }, 'user-a', 'all')).toBe(true);
  });
});
