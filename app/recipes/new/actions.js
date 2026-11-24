'use server';

import { redirect } from 'next/navigation';
import { addRecipe } from '../../../lib/data.js';
import { validateRecipe } from '../../../lib/validate.js';
import { DIETARY_TAGS } from '../../../lib/constants.js';
import { getSignedInUser } from '../../../auth.js';

export async function createRecipe(previousState, formData) {
  const user = await getSignedInUser();
  const values = Object.fromEntries(
    ['authorName', 'title', 'cuisine', 'category', 'ingredients', 'steps', 'prepTimeMinutes', 'imageUrl']
      .map((field) => {
        const value = formData.get(field);
        return [field, typeof value === 'string' ? value : ''];
      }),
  );
  if (user) values.authorName = user.name;
  const selectedTags = formData.getAll('dietaryTags');
  values.dietaryTags = DIETARY_TAGS.filter((tag) => selectedTags.includes(tag));
  const errors = validateRecipe(values);
  if (Object.keys(errors).length) {
    return { values, errors, attempt: previousState.attempt + 1 };
  }

  const recipe = {
    ...values,
    authorName: values.authorName.trim(),
    authorEmail: user?.email ?? null,
    title: values.title.trim(),
    ingredients: splitLines(values.ingredients),
    steps: splitLines(values.steps),
    prepTimeMinutes: Number(values.prepTimeMinutes),
    imageUrl: values.imageUrl.trim(),
  };
  await addRecipe(recipe);
  redirect('/');
}

function splitLines(text) {
  return text.split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
}
