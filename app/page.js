import FilterBar from '@/components/FilterBar';
import RecipeCard from '@/components/RecipeCard';
import { getRecipes } from '@/lib/data';
import { filterRecipes } from '@/lib/filter';
import { sortRecipes } from '@/lib/sort';

export const dynamic = 'force-dynamic';

export default async function HomePage({ searchParams }) {
  const params = await searchParams;
  const filters = Object.fromEntries(['cuisine', 'category', 'q', 'sort', 'dietaryTag'].map((name) => [
    name, typeof params[name] === 'string' ? params[name] : '',
  ]));
  const recipes = sortRecipes(filterRecipes(await getRecipes(), filters), filters.sort);

  return (
    <main>
      <section className="hero">
        <p className="eyebrow">A passport for your kitchen</p>
        <h1>RecipeShare</h1>
        <p className="lede">Dishes from cooks around the world. Pick a cuisine, choose a course, and get cooking.</p>
      </section>
      <FilterBar key={JSON.stringify(filters)} {...filters} />
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
