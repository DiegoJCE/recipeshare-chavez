import Link from 'next/link';
import { notFound } from 'next/navigation';
import RatingForm from '@/components/RatingForm';
import ServingsScaler from '@/components/ServingsScaler';
import { getRecipe } from '@/lib/data';
import { averageRating } from '@/lib/ratings';
import { rateRecipe } from './actions';

export const dynamic = 'force-dynamic';

export default async function RecipePage({ params }) {
  const { id } = await params;
  const recipe = await getRecipe(id);
  if (!recipe) notFound();

  const { title, authorName, cuisine, category, prepTimeMinutes, imageUrl, ingredients, steps, ratings, dietaryTags = [] } = recipe;
  const ratingCount = ratings.length;

  return (
    <main className="narrow">
      <Link href="/" className="back-link">← All recipes</Link>
      <article className="recipe-detail">
        <div className="recipe-detail-photo">
          <img src={imageUrl} alt={title} />
          <span className="stamp">{cuisine}</span>
        </div>

        <div className="recipe-detail-body">
          <h1>{title}</h1>
          <p className="byline">By {authorName}</p>

          <dl className="facts">
            <div className="fact">
              <dt>Cuisine</dt>
              <dd>{cuisine}</dd>
            </div>
            <div className="fact">
              <dt>Category</dt>
              <dd>{category}</dd>
            </div>
            <div className="fact">
              <dt>Prep time</dt>
              <dd>{prepTimeMinutes} minutes</dd>
            </div>
            {dietaryTags.length > 0 && (
              <div className="fact">
                <dt>Dietary tags</dt>
                <dd>{dietaryTags.join(', ')}</dd>
              </div>
            )}
            <div className="fact">
              <dt>Average rating</dt>
              <dd>
                <span className="rating-summary">
                  <span className="star" aria-hidden="true">★</span>
                  {averageRating(ratings).toFixed(1)} / 5{' '}
                  <span className="rating-count">({ratingCount} {ratingCount === 1 ? 'rating' : 'ratings'})</span>
                </span>
              </dd>
            </div>
          </dl>

          <RatingForm action={rateRecipe.bind(null, id)} />

          <div className="recipe-sections">
            <ServingsScaler ingredients={ingredients} />

            <section>
              <h2>Steps</h2>
              <ol className="step-list">
                {steps.map((step, index) => <li key={index}>{step}</li>)}
              </ol>
            </section>
          </div>
        </div>
      </article>
    </main>
  );
}
