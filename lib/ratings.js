export function isValidRating(rating) {
  return Number.isInteger(rating) && rating >= 1 && rating <= 5;
}

export function averageRating(ratings) {
  if (ratings.length === 0) return 0;

  const total = ratings.reduce((sum, rating) => sum + rating, 0);
  return Math.round((total * 10) / ratings.length) / 10;
}
