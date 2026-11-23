import { expect, test } from 'vitest';
import { addRating, addRecipe, getRecipe } from './data.js';
import { averageRating, isValidRating } from './ratings.js';

test('returns zero when there are no ratings', () => {
  expect(averageRating([])).toBe(0);
});

test('returns the only rating when there is one', () => {
  expect(averageRating([4])).toBe(4);
});

test('rounds the average of mixed ratings to one decimal place', () => {
  expect(averageRating([5, 4, 4])).toBe(4.3);
});

test.each([0, 6, 2.5, 'x'])('rejects invalid rating %s', (rating) => {
  expect(isValidRating(rating)).toBe(false);
});

test.each([1, 5])('accepts valid rating %s', (rating) => {
  expect(isValidRating(rating)).toBe(true);
});

test('updates the stored average and count after adding a rating', async () => {
  const { id } = await addRecipe({ title: 'Rating test recipe' });
  await addRating(id, 3);
  await addRating(id, 4);

  const { ratings } = await getRecipe(id);
  expect(averageRating(ratings)).toBe(3.5);
  expect(ratings).toHaveLength(2);
});
