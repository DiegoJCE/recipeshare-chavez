import RecipeCard from '@/components/RecipeCard';
import { getRecipes } from '@/lib/data';

export const dynamic = 'force-dynamic';

export default async function HomePage() {
  const recipes = await getRecipes();

  return (
    <main>
      <h1>RecipeShare</h1>
      <ul className="recipe-grid">
        {recipes.map((recipe) => (
          <li key={recipe.id}>
            <RecipeCard recipe={recipe} />
          </li>
        ))}
      </ul>
    </main>
  );
}
