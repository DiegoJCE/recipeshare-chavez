import Link from 'next/link';
import { averageRating } from '@/lib/ratings';

export default function RecipeCard({ recipe }) {
  const { id, title, imageUrl, cuisine, category, ratings, dietaryTags = [] } = recipe;
  const ratingCount = ratings.length;

  return (
    <article className="recipe-card">
      <Link href={`/recipes/${id}`} className="recipe-card-link">
        <div className="recipe-card-photo">
          <img src={imageUrl} alt={title} />
          <span className="stamp">{cuisine}</span>
        </div>
        <div className="recipe-card-content">
          <h2>{title}</h2>
          <div className="recipe-card-meta">
            <p><span className="sr-only">{cuisine} · </span><span className="tag">{category}</span></p>
            <p className="rating-summary">
              <span className="star" aria-hidden="true">★</span>
              {averageRating(ratings).toFixed(1)} / 5{' '}
              <span className="rating-count">({ratingCount} {ratingCount === 1 ? 'rating' : 'ratings'})</span>
            </p>
          </div>
          {dietaryTags.length > 0 && (
            <ul className="dietary-tags" aria-label="Dietary tags">
              {dietaryTags.map((tag) => <li className="tag" key={tag}>{tag}</li>)}
            </ul>
          )}
        </div>
      </Link>
    </article>
  );
}
