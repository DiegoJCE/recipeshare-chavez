import { expect, test } from 'vitest';
import { CATEGORIES, CUISINES } from './constants.js';

test('CUISINES matches the spec in order', () => {
  expect(CUISINES).toEqual([
    'American',
    'Arabic',
    'Chinese',
    'German',
    'Indian',
    'Iranian',
    'Italian',
    'Japanese',
    'Mexican',
    'Other',
  ]);
});

test('CATEGORIES matches the spec in order', () => {
  expect(CATEGORIES).toEqual([
    'Breakfast',
    'Main Dish',
    'Fast Food',
    'Soup',
    'Salad',
    'Dessert',
    'Snack',
    'Drink',
  ]);
});
