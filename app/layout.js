import Link from 'next/link';
import './globals.css';

export const metadata = {
  title: 'RecipeShare',
  description: 'Share and discover recipes from around the world.',
};

export default function RootLayout({ children }) {
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
            <nav>
              <Link href="/recipes/new" className="button button-gold">Add recipe</Link>
            </nav>
          </div>
        </header>
        {children}
      </body>
    </html>
  );
}
