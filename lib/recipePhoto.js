export const MAX_PHOTO_BYTES = 4_000_000;
export const PHOTO_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

export function validatePhotoFile(file) {
  if (!file.size || !PHOTO_TYPES.includes(file.type)) {
    return 'Choose a JPEG, PNG, WebP, or GIF image.';
  }
  if (file.size > MAX_PHOTO_BYTES) return 'Choose an image that is 4 MB or smaller.';
}
