import { expect, test } from 'vitest';
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
