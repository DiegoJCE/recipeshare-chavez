export function averageRating(ratings) {
  if (ratings.length === 0) return 0;

  const total = ratings.reduce((sum, rating) => sum + rating, 0);
  return Math.round((total * 10) / ratings.length) / 10;
}
