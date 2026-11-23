import Link from 'next/link';
import { averageRating } from '@/lib/ratings';

export default function RecipeCard({ recipe }) {
  const { id, title, imageUrl, cuisine, category, ratings } = recipe;
  const ratingCount = ratings.length;

  return (
    <article className="recipe-card">
      <Link href={`/recipes/${id}`} style={{ display: 'block', height: '100%', color: 'inherit' }}>
        <img src={imageUrl} alt={title} />
        <div className="recipe-card-content">
          <h2>{title}</h2>
          <p>{cuisine} · {category}</p>
          <p>{averageRating(ratings).toFixed(1)} / 5 ({ratingCount} {ratingCount === 1 ? 'rating' : 'ratings'})</p>
        </div>
      </Link>
    </article>
  );
}
