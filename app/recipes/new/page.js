import Link from 'next/link';
import RecipeForm from '@/components/RecipeForm';

export default function NewRecipePage() {
  return (
    <main className="narrow">
      <Link href="/" className="back-link">← All recipes</Link>
      <section className="hero">
        <p className="eyebrow">Share a dish</p>
        <h1>Add recipe</h1>
        <p className="lede">Put one ingredient or step on each line. Include a photo by URL or file upload.</p>
      </section>
      <div className="form-card">
        <RecipeForm />
      </div>
    </main>
  );
}
