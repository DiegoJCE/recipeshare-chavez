import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getSignedInUser } from '@/auth';
import RecipeForm from '@/components/RecipeForm';
import { getOwnedRecipe } from '@/lib/data';
import { editRecipe } from './actions';

export const dynamic = 'force-dynamic';

export default async function EditRecipePage({ params }) {
  const { id } = await params;
  const user = await getSignedInUser();
  const recipe = user && await getOwnedRecipe(id, user.email);
  if (!recipe) notFound();

  const { authorName, title, cuisine, category, ingredients, steps, prepTimeMinutes, imageUrl, dietaryTags } = recipe;

  return (
    <main className="narrow">
      <Link href={`/recipes/${id}`} className="back-link">← Back to recipe</Link>
      <section className="hero">
        <h1>Edit recipe</h1>
        <p className="lede">Put one ingredient or step on each line and include an image URL.</p>
      </section>
      <div className="form-card">
        <RecipeForm
          authorName={authorName}
          saveRecipe={editRecipe.bind(null, id)}
          initialValues={{
            title, cuisine, category, prepTimeMinutes, imageUrl, dietaryTags,
            ingredients: ingredients.join('\n'),
            steps: steps.join('\n'),
          }}
        />
      </div>
    </main>
  );
}
