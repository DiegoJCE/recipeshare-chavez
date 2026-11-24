import NextAuth from 'next-auth';
import Google from 'next-auth/providers/google';

export const googleSignInEnabled = Boolean(
  process.env.AUTH_SECRET && process.env.AUTH_GOOGLE_ID && process.env.AUTH_GOOGLE_SECRET,
);

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [Google],
  callbacks: {
    signIn({ profile }) {
      return profile?.email_verified === true && Boolean(profile.email && profile.name?.trim());
    },
    jwt({ token }) {
      return { name: token.name, email: token.email };
    },
  },
});

export async function getSignedInUser() {
  if (!googleSignInEnabled) return null;
  return (await auth())?.user ?? null;
}
