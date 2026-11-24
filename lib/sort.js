import { averageRating } from './ratings.js';

// The data layer returns recipes in ascending insertion order.
export function sortRecipes(recipes, sort) {
  const newestFirst = [...recipes].reverse();
  if (sort === 'highest-rated') {
    newestFirst.sort((a, b) => averageRating(b.ratings) - averageRating(a.ratings));
  }
  return newestFirst;
}
