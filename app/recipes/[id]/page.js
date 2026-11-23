import { notFound } from 'next/navigation';
import RatingForm from '@/components/RatingForm';
import { getRecipe } from '@/lib/data';
import { averageRating } from '@/lib/ratings';
import { rateRecipe } from './actions';

export const dynamic = 'force-dynamic';

export default async function RecipePage({ params }) {
  const { id } = await params;
  const recipe = await getRecipe(id);
  if (!recipe) notFound();

  const { title, authorName, cuisine, category, prepTimeMinutes, imageUrl, ingredients, steps, ratings } = recipe;
  const ratingCount = ratings.length;

  return (
    <main>
      <h1>{title}</h1>
      <p>By {authorName}</p>
      <img src={imageUrl} alt={title} style={{ display: 'block', maxWidth: '100%', height: 'auto' }} />
      <p>{cuisine} · {category}</p>
      <p>Prep time: {prepTimeMinutes} minutes</p>
      <p>Average rating: {averageRating(ratings).toFixed(1)} / 5 ({ratingCount} {ratingCount === 1 ? 'rating' : 'ratings'})</p>
      <RatingForm action={rateRecipe.bind(null, id)} />

      <h2>Ingredients</h2>
      <ul>
        {ingredients.map((ingredient, index) => <li key={index}>{ingredient}</li>)}
      </ul>

      <h2>Steps</h2>
      <ol>
        {steps.map((step, index) => <li key={index}>{step}</li>)}
      </ol>
    </main>
  );
}
