import Link from 'next/link';
import RecipeForm from '@/components/RecipeForm';
import { getSignedInUser } from '@/auth';
import { createRecipe } from './actions';

export default async function NewRecipePage() {
  const user = await getSignedInUser();
  return (
    <main className="narrow">
      <Link href="/" className="back-link">← All recipes</Link>
      <section className="hero">
        <p className="eyebrow">Share a dish</p>
        <h1>Add recipe</h1>
        <p className="lede">Put one ingredient or step on each line. Add an image URL or upload a food photo.</p>
      </section>
      <div className="form-card">
        <RecipeForm authorName={user?.name} saveRecipe={createRecipe} />
      </div>
    </main>
  );
}
