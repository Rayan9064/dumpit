'use client'

import type { User } from 'firebase/auth';

export const authFetch = async (
  user: User,
  input: RequestInfo | URL,
  init: RequestInit = {}
) => {
  const headers = new Headers(init.headers);
  headers.set('Authorization', `Bearer ${await user.getIdToken()}`);

  return fetch(input, {
    ...init,
    headers,
  });
};

export const jsonAuthFetch = async (
  user: User,
  input: RequestInfo | URL,
  init: RequestInit = {}
) => {
  const headers = new Headers(init.headers);
  headers.set('Content-Type', 'application/json');

  return authFetch(user, input, {
    ...init,
    headers,
  });
};
