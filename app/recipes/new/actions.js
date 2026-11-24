'use server';

import { redirect } from 'next/navigation';
import { addRecipe } from '@/lib/data';
import { validateRecipe } from '@/lib/validate';
import { DIETARY_TAGS } from '@/lib/constants';
import { uploadPhoto, validatePhoto } from '@/lib/photo';

export async function createRecipe(previousState, formData) {
  const values = Object.fromEntries(
    ['authorName', 'title', 'cuisine', 'category', 'ingredients', 'steps', 'prepTimeMinutes', 'imageUrl']
      .map((field) => {
        const value = formData.get(field);
        return [field, typeof value === 'string' ? value : ''];
      }),
  );
  const selectedTags = formData.getAll('dietaryTags');
  values.dietaryTags = DIETARY_TAGS.filter((tag) => selectedTags.includes(tag));
  const photo = formData.get('photo');
  const hasPhoto = photo instanceof File && photo.size > 0;
  const errors = validateRecipe(values, { hasPhoto });
  const invalidSubmission = { values, errors, attempt: previousState.attempt + 1, hadPhoto: hasPhoto };
  if (hasPhoto) {
    const photoError = await validatePhoto(photo);
    if (photoError) errors.photo = photoError;
  }
  if (Object.keys(errors).length) return invalidSubmission;

  const recipe = {
    ...values,
    authorName: values.authorName.trim(),
    title: values.title.trim(),
    ingredients: splitLines(values.ingredients),
    steps: splitLines(values.steps),
    prepTimeMinutes: Number(values.prepTimeMinutes),
    imageUrl: values.imageUrl.trim(),
  };
  if (hasPhoto) {
    try {
      recipe.imageUrl = await uploadPhoto(photo);
    } catch (error) {
      console.error('Recipe photo upload failed', error);
      errors.photo = 'The photo could not be uploaded. Try again or use an image URL.';
      return invalidSubmission;
    }
  }
  await addRecipe(recipe);
  redirect('/');
}

function splitLines(text) {
  return text.split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
}
