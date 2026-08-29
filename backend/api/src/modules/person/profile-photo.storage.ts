import { join, resolve } from 'path';

export const profilePhotosDirectory = resolve(
  process.env.PROFILE_PHOTOS_DIR ?? join(process.cwd(), 'uploads', 'profile-photos'),
);

export const profilePhotoMimeTypes = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
]);

export const profilePhotoMaxBytes = 3 * 1024 * 1024;
