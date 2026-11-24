import { expect, it } from 'vitest';
import { sortRecipes } from './sort.js';

it('sorts by insertion order or average rating, breaking ties by newest', () => {
  const older = { position: '9', ratings: [4, 5] };
  const newer = { position: '10', ratings: [5, 4] };
  const unrated = { position: '11', ratings: [] };
  const recipes = [older, unrated, newer];
  expect(sortRecipes(recipes, 'newest')).toEqual([unrated, newer, older]);
  expect(sortRecipes(recipes, 'highest-rated')).toEqual([newer, older, unrated]);
  expect(recipes[0]).toBe(older);
});
