import { getRecipes } from '@/lib/data';

export const dynamic = 'force-dynamic';

export default async function HomePage() {
  const recipes = await getRecipes();

  return (
    <main>
      <h1>RecipeShare</h1>
      <ul>
        {recipes.map((recipe) => (
          <li key={recipe.id}>{recipe.title}</li>
        ))}
      </ul>
    </main>
  );
}
