import './globals.css';

export const metadata = {
  title: 'RecipeShare',
  description: 'Share and discover recipes from around the world.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
