import { expect, it } from 'vitest';
import { sortRecipes } from './sort.js';

it('sorts by insertion order or average rating, breaking ties by newest', () => {
  const older = { ratings: [4, 5] };
  const newer = { ratings: [5, 4] };
  const unrated = { ratings: [] };
  const recipes = [older, newer, unrated];
  expect(sortRecipes(recipes, 'newest')).toEqual([unrated, newer, older]);
  expect(sortRecipes(recipes, 'highest-rated')).toEqual([newer, older, unrated]);
  expect(recipes[0]).toBe(older);
});
