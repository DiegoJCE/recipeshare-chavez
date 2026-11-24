import { put } from '@vercel/blob';
import { normalizeRecipeForm, readRecipeForm } from './recipeForm.js';
import { validateRecipe } from './validate.js';

const photoFormats = {
  'image/jpeg': { extension: 'jpg', signature: 'ffd8ff' },
  'image/png': { extension: 'png', signature: '89504e470d0a1a0a' },
  'image/webp': { extension: 'webp', signature: /^52494646.{8}57454250/ },
  'image/gif': { extension: 'gif', signature: /^47494638(37|39)61/ },
};

export async function prepareRecipeForm(previousState, formData, authorName) {
  const values = readRecipeForm(formData, authorName);
  const candidate = formData.get('imageFile');
  const file = candidate instanceof File && candidate.name ? candidate : null;
  const errors = validateRecipe(values, file);

  if (file && !Object.keys(errors).length) {
    const { extension, signature } = photoFormats[file.type];
    const header = Buffer.from(await file.slice(0, 12).arrayBuffer()).toString('hex');
    const matches = typeof signature === 'string' ? header.startsWith(signature) : signature.test(header);
    if (!matches) {
      errors.imageFile = 'Choose a valid image file.';
    } else {
      try {
        const blob = await put(`recipes/photo.${extension}`, file, {
          access: 'public',
          addRandomSuffix: true,
          contentType: file.type,
        });
        values.imageUrl = blob.url;
      } catch {
        errors.imageFile = 'The photo could not be uploaded. Try again or enter an image URL.';
      }
    }
  }

  if (Object.keys(errors).length) {
    return { state: { values, errors, attempt: previousState.attempt + 1 } };
  }
  return { recipe: normalizeRecipeForm(values) };
}
