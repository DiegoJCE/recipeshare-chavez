import { describe, expect, it } from 'vitest';
import { validateRecipe } from './validate.js';

const validRecipe = {
  authorName: 'Taylor',
  title: 'Tomato Soup',
  cuisine: 'Italian',
  category: 'Soup',
  ingredients: 'Tomatoes\nBasil',
  steps: 'Simmer tomatoes.\nAdd basil.',
  prepTimeMinutes: '20',
  imageUrl: 'https://example.com/soup.jpg',
};

describe('validateRecipe', () => {
  it('accepts a complete valid recipe', () => {
    expect(validateRecipe(validRecipe)).toEqual({});
  });

  it.each(Object.keys(validRecipe))('reports an empty %s by name', (field) => {
    const errors = validateRecipe({ ...validRecipe, [field]: '   ' });
    expect(Object.keys(errors)).toEqual([field]);
  });

  it.each(['cuisine', 'category'])('rejects a %s outside the fixed list', (field) => {
    const errors = validateRecipe({ ...validRecipe, [field]: 'Unknown' });
    expect(Object.keys(errors)).toEqual([field]);
  });

  it.each(['0', '-1', '2.5', 'abc'])('rejects %s as prep time', (prepTimeMinutes) => {
    expect(validateRecipe({ ...validRecipe, prepTimeMinutes })).toHaveProperty('prepTimeMinutes');
  });

  it.each(['ftp://example.com/soup.jpg', '/soup.jpg', 'https://'])('rejects %s as an image URL', (imageUrl) => {
    expect(validateRecipe({ ...validRecipe, imageUrl })).toHaveProperty('imageUrl');
  });
});
