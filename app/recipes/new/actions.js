'use server';

import { redirect } from 'next/navigation';
import { addRecipe } from '../../../lib/data.js';
import { readRecipeForm, normalizeRecipeForm } from '../../../lib/recipeForm.js';
import { validateRecipe } from '../../../lib/validate.js';
import { getSignedInUser } from '../../../auth.js';

export async function createRecipe(previousState, formData) {
  const user = await getSignedInUser();
  const values = readRecipeForm(formData, user?.name);
  const errors = validateRecipe(values);
  if (Object.keys(errors).length) {
    return { values, errors, attempt: previousState.attempt + 1 };
  }

  await addRecipe({ ...normalizeRecipeForm(values), authorEmail: user?.email ?? null });
  redirect('/');
}
