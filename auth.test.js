import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import NextAuth from 'next-auth';

vi.mock('next-auth', () => ({ default: vi.fn() }));
vi.mock('next-auth/providers/google', () => ({ default: vi.fn() }));

const readSession = vi.fn();
const identity = { name: 'Google Cook', email: 'cook@example.com' };

beforeEach(() => {
  vi.resetModules();
  vi.clearAllMocks();
  vi.mocked(NextAuth).mockReturnValue({ auth: readSession });
  vi.stubEnv('AUTH_SECRET', 'test-secret');
  vi.stubEnv('AUTH_GOOGLE_ID', 'test-client');
  vi.stubEnv('AUTH_GOOGLE_SECRET', 'test-client-secret');
});

afterEach(() => vi.unstubAllEnvs());

it('skips session lookup when Google sign-in is unconfigured', async () => {
  vi.stubEnv('AUTH_SECRET', undefined);
  const { googleSignInEnabled, getSignedInUser } = await import('./auth.js');

  expect(googleSignInEnabled).toBe(false);
  await expect(getSignedInUser()).resolves.toBeNull();
  expect(readSession).not.toHaveBeenCalled();
});

it('requires a verified Google email and a name for recipe ownership', async () => {
  await import('./auth.js');
  const { signIn } = vi.mocked(NextAuth).mock.lastCall[0].callbacks;
  const account = { provider: 'google' };
  const profile = { ...identity, email_verified: true, sub: 'google-cook' };

  expect(signIn({ account, profile })).toBe(true);
  expect(signIn({ account, profile: { ...profile, email_verified: false } })).toBe(false);
  expect(signIn({ account, profile: { ...profile, name: ' ' } })).toBe(false);
  expect(signIn({ account, profile: { ...profile, email: '' } })).toBe(false);
  expect(signIn({ account, profile: { ...profile, sub: undefined } })).toBe(false);
  expect(signIn({ account: { provider: 'other' }, profile })).toBe(false);
});

it('treats legacy email-only sessions as guests even if their token has a generic subject', async () => {
  const { getSignedInUser } = await import('./auth.js');
  const { jwt, session } = vi.mocked(NextAuth).mock.lastCall[0].callbacks;
  const token = jwt({ token: { ...identity, sub: 'generic-auth-id' } });
  readSession.mockResolvedValueOnce(session({ session: { user: { ...identity } }, token }));

  await expect(getSignedInUser()).resolves.toBeNull();
});

it('keeps the verified Google subject across session refreshes and email changes', async () => {
  const { getSignedInUser } = await import('./auth.js');
  const { jwt, session } = vi.mocked(NextAuth).mock.lastCall[0].callbacks;
  const googleSubject = 'google-cook';
  const token = jwt({
    token: { ...identity, sub: 'generic-auth-id' },
    account: { provider: 'google' },
    profile: { sub: googleSubject },
  });
  const refreshed = jwt({ token: { ...token, email: 'new@example.com' } });
  const user = { ...identity, email: refreshed.email };
  readSession.mockResolvedValueOnce(session({ session: { user }, token: refreshed }));

  await expect(getSignedInUser()).resolves.toEqual({ ...user, googleSubject });
});
