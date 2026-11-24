import Link from 'next/link';
import { getSignedInUser, googleSignInEnabled } from '@/auth';
import { signInWithGoogle, signOutOfRecipeShare } from './auth-actions';
import './globals.css';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'RecipeShare',
  description: 'Share and discover recipes from around the world.',
};

export default async function RootLayout({ children }) {
  const user = await getSignedInUser();
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,500;9..144,600;9..144,700&family=IBM+Plex+Sans:ital,wght@0,400;0,600;1,400&display=swap"
        />
      </head>
      <body>
        <header className="site-header">
          <div className="site-header-inner">
            <Link href="/" className="brand">
              <span className="brand-mark" aria-hidden="true">✈</span>
              <span>Recipe<span className="brand-accent">Share</span></span>
            </Link>
            <nav className="site-nav">
              <Link href="/recipes/new" className="button button-gold">Add recipe</Link>
              {user && <Link href="/profile">Profile</Link>}
              {googleSignInEnabled && (
                <form action={user ? signOutOfRecipeShare : signInWithGoogle}>
                  <button type="submit" className="button button-primary">
                    {user ? 'Sign out' : 'Sign in with Google'}
                  </button>
                </form>
              )}
            </nav>
          </div>
        </header>
        {children}
        <footer className="site-footer"><Link href="/privacy">Privacy</Link></footer>
      </body>
    </html>
  );
}
