import { Router } from 'express';
import z from 'zod';
import { ok } from '../../lib/responses';
import { requireAuth, requireShop } from '../../middleware/auth';
import { validate } from '../../middleware/validate';
import { ValidationError } from '../../lib/errors';
import { isCloudinaryConfigured, uploadImage } from './cloudinary.service';

const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
const MAX_IMAGE_BYTES = 5 * 1024 * 1024; // 5MB

const uploadSchema = z.object({
  dataUrl: z.string().min(1, 'Image data is required'),
  folder: z.string().trim().max(100).optional(),
});

function validateImageData(dataUrl: string, folder?: string) {
  const match = /^data:(image\/(?:jpeg|jpg|png|webp));base64,(.+)$/.exec(dataUrl);
  if (!match) {
    throw new ValidationError('Invalid image. Allowed types: JPG, PNG, WEBP.');
  }
  const mime = match[1];
  if (!ALLOWED_TYPES.includes(mime)) {
    throw new ValidationError('Invalid image type. Allowed types: JPG, PNG, WEBP.');
  }
  const approxBytes = Math.floor((match[2].length * 3) / 4);
  if (approxBytes > MAX_IMAGE_BYTES) {
    throw new ValidationError('Image is too large. Maximum size is 5MB.');
  }
  return { mime, folder };
}

const router = Router();

// Public-safe config probe: returns whether uploads are enabled and the cloud
// name (never the secret). No auth required so the storefront can detect it.
router.get('/config', (_req, res) => {
  return ok(res, {
    configured: isCloudinaryConfigured(),
    cloudName: isCloudinaryConfigured() ? process.env.CLOUDINARY_CLOUD_NAME : null,
  });
});

// Authenticated upload (business users only).
router.post('/upload', requireAuth, requireShop, validate(uploadSchema), async (req, res, next) => {
  try {
    const body = req.body as { dataUrl: string; folder?: string };
    validateImageData(body.dataUrl, body.folder);
    if (!isCloudinaryConfigured()) {
      return ok(res, {
        configured: false,
        message: 'Cloudinary is not configured. Provide CLOUDINARY_* environment variables to enable image uploads.',
      });
    }
    const result = await uploadImage({ dataUrl: body.dataUrl, folder: body.folder });
    return ok(res, result);
  } catch (error) {
    next(error);
  }
});

export default router;
