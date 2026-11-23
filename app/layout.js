import Link from 'next/link';
import './globals.css';

export const metadata = {
  title: 'RecipeShare',
  description: 'Share and discover recipes from around the world.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <header>
          <nav><Link href="/recipes/new">Add recipe</Link></nav>
        </header>
        {children}
      </body>
    </html>
  );
}
