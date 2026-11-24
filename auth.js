import NextAuth from 'next-auth';
import Google from 'next-auth/providers/google';

export const googleSignInEnabled = Boolean(
  process.env.AUTH_SECRET && process.env.AUTH_GOOGLE_ID && process.env.AUTH_GOOGLE_SECRET,
);

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: googleSignInEnabled ? [Google] : [],
  callbacks: {
    signIn({ account, profile }) {
      return account?.provider === 'google'
        && profile?.email_verified === true
        && hasRecipeIdentity(profile)
        && hasGoogleSubject(profile?.sub);
    },
    jwt({ token, account, profile }) {
      const googleSubject = account
        ? (account.provider === 'google' ? profile?.sub : undefined)
        : token.googleSubject;
      return { name: token.name, email: token.email, googleSubject };
    },
    session({ session, token }) {
      session.user.googleSubject = token.googleSubject;
      return session;
    },
  },
});

export async function getSignedInUser() {
  if (!googleSignInEnabled) return null;
  const user = (await auth())?.user;
  return hasRecipeIdentity(user) && hasGoogleSubject(user.googleSubject) ? user : null;
}

function hasGoogleSubject(subject) {
  return typeof subject === 'string' && subject.trim() !== '';
}

function hasRecipeIdentity(user) {
  return typeof user?.name === 'string' && user.name.trim() !== ''
    && typeof user.email === 'string' && user.email.trim() !== '';
}
