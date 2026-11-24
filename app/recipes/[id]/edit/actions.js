'use server';

import { revalidatePath } from 'next/cache';
import { notFound, redirect } from 'next/navigation';
import { getSignedInUser } from '../../../../auth.js';
import { deleteOwnedRecipe, getOwnedRecipe, updateOwnedRecipe } from '../../../../lib/data.js';
import { prepareRecipeForm } from '../../../../lib/prepareRecipeForm.js';

export async function editRecipe(id, previousState, formData) {
  const user = await getSignedInUser();
  const recipe = user && await getOwnedRecipe(id, user.googleSubject);
  if (!recipe) notFound();

  const { recipe: updatedRecipe, state } = await prepareRecipeForm(previousState, formData, recipe.authorName);
  if (state) return state;

  if (!(await updateOwnedRecipe(id, user.googleSubject, updatedRecipe))) notFound();
  refreshRecipePages(id);
  redirect(`/recipes/${id}`);
}

export async function deleteRecipe(id) {
  const user = await getSignedInUser();
  if (!user || !(await deleteOwnedRecipe(id, user.googleSubject))) notFound();

  refreshRecipePages(id);
  redirect('/');
}

function refreshRecipePages(id) {
  revalidatePath(`/recipes/${id}`);
  revalidatePath('/');
  revalidatePath('/profile');
}
