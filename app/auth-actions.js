'use server';

import { googleSignInEnabled, signIn, signOut } from '@/auth';

export async function signInWithGoogle() {
  if (googleSignInEnabled) await signIn('google', { redirectTo: '/profile' });
}

export async function signOutOfRecipeShare() {
  if (googleSignInEnabled) await signOut({ redirectTo: '/' });
}
