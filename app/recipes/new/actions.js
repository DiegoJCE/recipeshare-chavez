'use server';

import { redirect } from 'next/navigation';
import { addRecipe } from '../../../lib/data.js';
import { prepareRecipeForm } from '../../../lib/prepareRecipeForm.js';
import { getSignedInUser } from '../../../auth.js';

export async function createRecipe(previousState, formData) {
  const user = await getSignedInUser();
  const { recipe, state } = await prepareRecipeForm(previousState, formData, user?.name);
  if (state) return state;

  await addRecipe({ ...recipe, authorEmail: user?.email ?? null, authorSubject: user?.googleSubject ?? null });
  redirect('/');
}
