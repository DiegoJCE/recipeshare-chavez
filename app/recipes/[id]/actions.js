'use server';

import { revalidatePath } from 'next/cache';
import { getSignedInUser } from '../../../auth.js';
import { addRating } from '../../../lib/data.js';
import { isValidRating } from '../../../lib/ratings.js';

export async function rateRecipe(id, formData) {
  const value = formData.get('rating');
  if (typeof value !== 'string') return;

  const rating = Number(value);
  if (!isValidRating(rating)) return;
  const user = await getSignedInUser();
  if (!user || !(await addRating(id, rating, user.email))) return;

  revalidatePath(`/recipes/${id}`);
  revalidatePath('/');
}
