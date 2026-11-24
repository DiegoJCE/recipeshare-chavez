import { put } from '@vercel/blob';

const photoTypes = { 'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp' };
const maxPhotoBytes = 3 * 1024 * 1024;

export async function validatePhoto(file) {
  if (file.size > maxPhotoBytes) return 'Choose a photo up to 3 MB.';
  if (!Object.hasOwn(photoTypes, file.type)) return 'Choose a JPEG, PNG, or WebP image.';

  const bytes = new Uint8Array(await file.slice(0, 12).arrayBuffer());
  const startsWith = (signature, offset = 0) => signature.every((byte, i) => bytes[offset + i] === byte);
  const valid = {
    'image/jpeg': startsWith([0xff, 0xd8, 0xff]),
    'image/png': startsWith([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    'image/webp': startsWith([0x52, 0x49, 0x46, 0x46]) && startsWith([0x57, 0x45, 0x42, 0x50], 8),
  };
  return valid[file.type] ? '' : 'The file contents do not match the image format.';
}

export async function uploadPhoto(file) {
  const { url } = await put(`recipes/photo.${photoTypes[file.type]}`, file, {
    access: 'public',
    addRandomSuffix: true,
    contentType: file.type,
  });
  return url;
}
