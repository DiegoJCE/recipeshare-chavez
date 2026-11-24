import { DIETARY_TAGS } from './constants.js';

export function readRecipeForm(formData, authorName) {
  const values = Object.fromEntries(
    ['authorName', 'title', 'cuisine', 'category', 'ingredients', 'steps', 'prepTimeMinutes', 'imageUrl', 'videoUrl']
      .map((field) => {
        const value = formData.get(field);
        return [field, typeof value === 'string' ? value : ''];
      }),
  );
  if (authorName) values.authorName = authorName;
  const selectedTags = formData.getAll('dietaryTags');
  values.dietaryTags = DIETARY_TAGS.filter((tag) => selectedTags.includes(tag));
  return values;
}

export function normalizeRecipeForm(values) {
  return {
    ...values,
    authorName: values.authorName.trim(),
    title: values.title.trim(),
    ingredients: splitLines(values.ingredients),
    steps: splitLines(values.steps),
    prepTimeMinutes: Number(values.prepTimeMinutes),
    imageUrl: values.imageUrl.trim(),
    videoUrl: values.videoUrl?.trim() || null,
  };
}

function splitLines(text) {
  return text.split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
}
