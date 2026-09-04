import { v2 as cloudinary } from 'cloudinary';
import { cloudinaryConfigured, env } from '../../config/env';
import { AppError } from '../../lib/errors';

if (cloudinaryConfigured) {
  cloudinary.config({
    cloud_name: env.cloudinaryCloudName,
    api_key: env.cloudinaryApiKey,
    api_secret: env.cloudinaryApiSecret,
    secure: true,
  });
}

export class CloudinaryNotConfiguredError extends AppError {
  constructor() {
    super(400, 'CLOUDINARY_NOT_CONFIGURED', 'Cloudinary is not configured. Add CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY and CLOUDINARY_API_SECRET.');
  }
}

export function isCloudinaryConfigured() {
  return cloudinaryConfigured;
}

// Uploads an image (base64 data URL) to Cloudinary and returns the secure URL
// and public id. All uploads are server-controlled with the API secret; it is
// never exposed to the browser.
export async function uploadImage(input: {
  dataUrl: string;
  folder?: string;
}): Promise<{ url: string; publicId: string }> {
  if (!cloudinaryConfigured) throw new CloudinaryNotConfiguredError();

  const result = await cloudinary.uploader.upload(input.dataUrl, {
    folder: input.folder ?? 'dukastock/products',
    resource_type: 'image',
    transformation: [
      { width: 800, crop: 'limit', quality: 'auto', fetch_format: 'auto' },
    ],
  });

  return { url: result.secure_url, publicId: result.public_id };
}

// Deletes an image by public id. Used when replacing/removing a product image
// so orphaned assets don't accumulate.
export async function deleteImage(publicId: string): Promise<void> {
  if (!cloudinaryConfigured) return;
  if (!publicId) return;
  try {
    await cloudinary.uploader.destroy(publicId);
  } catch {
    // Deleting an old asset must never break the surrounding operation.
  }
}

// Builds optimized/transformed URLs from a stored public id (thumbnail, card,
// detail), avoiding full-resolution originals on every surface.
export function transformedUrl(publicId: string, opts: { width?: number; quality?: string } = {}) {
  if (!publicId) return null;
  const width = opts.width ?? 400;
  const quality = opts.quality ?? 'auto';
  return cloudinary.url(publicId, {
    secure: true,
    transformation: [{ width, crop: 'limit', quality, fetch_format: 'auto' }],
  });
}
