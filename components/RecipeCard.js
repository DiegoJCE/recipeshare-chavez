import { averageRating } from '@/lib/ratings';

export default function RecipeCard({ recipe }) {
  const { title, imageUrl, cuisine, category, ratings } = recipe;
  const ratingCount = ratings.length;

  return (
    <article className="recipe-card">
      <img src={imageUrl} alt={title} />
      <div className="recipe-card-content">
        <h2>{title}</h2>
        <p>{cuisine} · {category}</p>
        <p>{averageRating(ratings).toFixed(1)} / 5 ({ratingCount} {ratingCount === 1 ? 'rating' : 'ratings'})</p>
      </div>
    </article>
  );
}
