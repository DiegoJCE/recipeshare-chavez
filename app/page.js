import FilterBar from '@/components/FilterBar';
import RecipeCard from '@/components/RecipeCard';
import { getRecipes } from '@/lib/data';
import { filterRecipes } from '@/lib/filter';

export const dynamic = 'force-dynamic';

export default async function HomePage({ searchParams }) {
  const { cuisine = '', category = '' } = await searchParams;
  const recipes = filterRecipes(await getRecipes(), { cuisine, category });

  return (
    <main>
      <section className="hero">
        <p className="eyebrow">A passport for your kitchen</p>
        <h1>RecipeShare</h1>
        <p className="lede">Dishes from cooks around the world. Pick a cuisine, choose a course, and get cooking.</p>
      </section>
      <FilterBar key={JSON.stringify([cuisine, category])} cuisine={cuisine} category={category} />
      {recipes.length ? (
        <ul className="recipe-grid">
          {recipes.map((recipe) => (
            <li key={recipe.id}>
              <RecipeCard recipe={recipe} />
            </li>
          ))}
        </ul>
      ) : (
        <p className="empty-state">No recipes found</p>
      )}
    </main>
  );
}
