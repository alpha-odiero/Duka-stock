// Cloudinary URL helpers. Products store an absolute imageUrl (usually a
// Cloudinary delivery URL) plus a cloudinaryPublicId. We never talk to the
// Cloudinary SDK on the client and never expose the API secret; we only apply
// read-only transformation parameters to the delivery URL so each surface loads
// an appropriately sized, auto-optimized variant instead of the original file.

interface TransformOptions {
  width?: number;
  height?: number;
  /** crop mode; default 'fill' keeps the aspect ratio boxed exactly */
  crop?: 'fit' | 'fill' | 'thumb';
}

/** True if the URL is a Cloudinary delivery URL we can transform. */
export function isCloudinaryUrl(url?: string | null): boolean {
  if (!url) return false;
  try {
    const u = new URL(url);
    return u.hostname.endsWith('res.cloudinary.com') && u.pathname.includes('/image/upload/');
  } catch {
    return false;
  }
}

/**
 * Returns a Cloudinary-transformed URL with `f_auto,q_auto` and a bounded
 * size/crop. Non-Cloudinary URLs are returned unchanged so we never break
 * arbitrary hosted images.
 */
export function cloudinaryTransform(
  url?: string | null,
  options: TransformOptions = {},
): string | undefined {
  if (!url) return undefined;
  if (!isCloudinaryUrl(url)) return url;

  const width = options.width ? Math.round(options.width) : undefined;
  const height = options.height ? Math.round(options.height) : undefined;
  const crop = options.crop ?? 'fill';

  const parts: string[] = [];
  if (width) parts.push(`w_${width}`);
  if (height) parts.push(`h_${height}`);
  if (width || height) parts.push(`c_${crop}`);
  parts.push('q_auto');
  parts.push('f_auto');
  const transform = parts.join(',');

  try {
    const u = new URL(url);
    const uploadIndex = u.pathname.indexOf('/image/upload/');
    if (uploadIndex === -1) return url;
    const insertAt = uploadIndex + '/image/upload/'.length;
    u.pathname = u.pathname.slice(0, insertAt) + transform + '/' + u.pathname.slice(insertAt);
    return u.toString();
  } catch {
    return url;
  }
}
