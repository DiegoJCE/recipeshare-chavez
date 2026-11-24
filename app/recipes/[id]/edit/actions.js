'use server';

import { revalidatePath } from 'next/cache';
import { notFound, redirect } from 'next/navigation';
import { getSignedInUser } from '../../../../auth.js';
import { deleteOwnedRecipe, getOwnedRecipe, updateOwnedRecipe } from '../../../../lib/data.js';
import { normalizeRecipeForm, readRecipeForm } from '../../../../lib/recipeForm.js';
import { validateRecipe } from '../../../../lib/validate.js';

export async function editRecipe(id, previousState, formData) {
  const user = await getSignedInUser();
  const recipe = user && await getOwnedRecipe(id, user.email);
  if (!recipe) notFound();

  const values = readRecipeForm(formData, recipe.authorName);
  const errors = validateRecipe(values);
  if (Object.keys(errors).length) {
    return { values, errors, attempt: previousState.attempt + 1 };
  }

  if (!(await updateOwnedRecipe(id, user.email, normalizeRecipeForm(values)))) notFound();
  refreshRecipePages(id);
  redirect(`/recipes/${id}`);
}

export async function deleteRecipe(id) {
  const user = await getSignedInUser();
  if (!user || !(await deleteOwnedRecipe(id, user.email))) notFound();

  refreshRecipePages(id);
  redirect('/');
}

function refreshRecipePages(id) {
  revalidatePath(`/recipes/${id}`);
  revalidatePath('/');
  revalidatePath('/profile');
}
