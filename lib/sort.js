import { averageRating } from './ratings.js';

export function sortRecipes(recipes, sort) {
  const newestFirst = [...recipes].sort((a, b) => Number(b.position) - Number(a.position));
  if (sort === 'highest-rated') {
    newestFirst.sort((a, b) => averageRating(b.ratings) - averageRating(a.ratings));
  }
  return newestFirst;
}
