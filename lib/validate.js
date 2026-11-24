import { CATEGORIES, CUISINES } from './constants.js';

export function validateRecipe(recipe, { hasPhoto = false } = {}) {
  const errors = {};
  for (const [field, label] of [
    ['authorName', 'author name'],
    ['title', 'title'],
    ['ingredients', 'ingredients'],
    ['steps', 'steps'],
  ]) {
    const value = recipe[field];
    const hasText = Array.isArray(value)
      ? value.some((line) => typeof line === 'string' && line.trim())
      : typeof value === 'string' && value.trim();
    if (!hasText) errors[field] = `Enter the ${label}.`;
  }

  if (!CUISINES.includes(recipe.cuisine)) errors.cuisine = 'Choose a cuisine.';
  if (!CATEGORIES.includes(recipe.category)) errors.category = 'Choose a category.';

  const prepTime = recipe.prepTimeMinutes;
  if (
    (typeof prepTime !== 'string' && typeof prepTime !== 'number') ||
    !Number.isSafeInteger(Number(prepTime)) ||
    Number(prepTime) <= 0
  ) {
    errors.prepTimeMinutes = 'Enter a positive whole number of minutes.';
  }

  const imageUrl = typeof recipe.imageUrl === 'string' ? recipe.imageUrl.trim() : '';
  if (!hasPhoto && (!/^https?:\/\//i.test(imageUrl) || !URL.canParse(imageUrl))) {
    errors.imageUrl = 'Enter an image URL starting with http:// or https://.';
  }

  return errors;
}
