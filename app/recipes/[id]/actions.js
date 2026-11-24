'use server';

import { revalidatePath } from 'next/cache';
import { getSignedInUser } from '../../../auth.js';
import { addComment, addRating } from '../../../lib/data.js';
import { COMMENT_MAX_LENGTH, isValidComment } from '../../../lib/comments.js';
import { isValidRating } from '../../../lib/ratings.js';

export async function rateRecipe(id, formData) {
  const value = formData.get('rating');
  if (typeof value !== 'string') return;

  const rating = Number(value);
  if (!isValidRating(rating)) return;
  const user = await getSignedInUser();
  if (!user || !(await addRating(id, rating, user))) return;

  revalidatePath(`/recipes/${id}`);
  revalidatePath('/');
}

export async function postComment(id, previousState, formData) {
  const user = await getSignedInUser();
  if (!user) return { error: 'Sign in to post a comment.' };

  const body = formData.get('comment');
  if (!isValidComment(body)) {
    return { error: `Enter a comment between 1 and ${COMMENT_MAX_LENGTH} characters.` };
  }
  if (!(await addComment(id, user.name, body.trim()))) {
    return { error: 'This recipe is no longer available.' };
  }

  revalidatePath(`/recipes/${id}`);
  return { error: '' };
}
