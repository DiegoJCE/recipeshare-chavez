import Link from 'next/link';
import { getSignedInUser, googleSignInEnabled } from '@/auth';
import RecipeCard from '@/components/RecipeCard';
import { getFavoriteRecipes, getRecipesByAuthor } from '@/lib/data';
import { signInWithGoogle } from '../auth-actions';

export const dynamic = 'force-dynamic';

export default async function ProfilePage() {
  const user = await getSignedInUser();

  if (!user) {
    return (
      <main className="narrow">
        <h1>Profile</h1>
        {googleSignInEnabled ? (
          <form action={signInWithGoogle}>
            <p>Sign in to see your recipes.</p>
            <button type="submit" className="button button-primary">Sign in with Google</button>
          </form>
        ) : <p>Google sign-in is unavailable.</p>}
      </main>
    );
  }

  const [recipes, favorites] = await Promise.all([
    getRecipesByAuthor(user),
    getFavoriteRecipes(user),
  ]);

  return (
    <main>
      <h1>My recipes</h1>
      {recipes.length ? (
        <ul className="recipe-grid">
          {recipes.map((recipe) => (
            <li key={recipe.id}><RecipeCard recipe={recipe} /></li>
          ))}
        </ul>
      ) : <p>You haven’t added any recipes yet. <Link href="/recipes/new">Add a recipe</Link>.</p>}
      <section aria-labelledby="favorites-heading">
        <h2 id="favorites-heading">My favorites</h2>
        {favorites.length ? (
          <ul className="recipe-grid">
            {favorites.map((recipe) => (
              <li key={recipe.id}><RecipeCard recipe={recipe} /></li>
            ))}
          </ul>
        ) : <p>You haven’t favorited any recipes yet.</p>}
      </section>
    </main>
  );
}
