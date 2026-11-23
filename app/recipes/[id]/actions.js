'use server';

import { revalidatePath } from 'next/cache';
import { addRating } from '@/lib/data';
import { isValidRating } from '@/lib/ratings';

export async function rateRecipe(id, formData) {
  const value = formData.get('rating');
  if (typeof value !== 'string') return;

  const rating = Number(value);
  if (!isValidRating(rating)) return;
  if (!(await addRating(id, rating))) return;

  revalidatePath(`/recipes/${id}`);
  revalidatePath('/');
}
