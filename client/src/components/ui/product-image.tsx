import { useState } from 'react';
import { Package } from 'lucide-react';
import { cn } from '@/lib/cn';
import { cloudinaryTransform } from '@/lib/cloudinary';

interface ProductImageProps {
  src?: string | null;
  alt?: string;
  /** Square rendered size in px — drives the Cloudinary transform (2x for DPR). */
  size?: number;
  /** Tailwind classes controlling the rendered box (rounded, dimensions...). */
  className?: string;
  /** Container class when both image and fallback render (aspect ratio etc.). */
  wrapperClassName?: string;
  /** Force lighter h/w for landscape dodging; default uses `size`. */
  width?: number;
  height?: number;
  objectFit?: 'cover' | 'contain';
}

/**
 * Product image with graceful placeholder + Cloudinary optimization.
 *
 * Renders the optimized image when a URL exists; otherwise shows a clean
 * neutral placeholder with the package glyph so lists never look broken or
 * sparse. `size` is the smallest *rendered* edge; the CDN is asked for 2x so
 * hi-DPI screens stay crisp.
 */
export function ProductImage({
  src,
  alt = '',
  size,
  width,
  height,
  className,
  wrapperClassName,
  objectFit = 'cover',
}: ProductImageProps) {
  const [failed, setFailed] = useState(false);

  const optimized = cloudinaryTransform(src, {
    width: width ?? size,
    height: height ?? size,
    crop: 'fill',
  });

  const hasImage = Boolean(optimized) && !failed && src;

  return (
    <div className={cn('relative flex items-center justify-center overflow-hidden bg-line/20', wrapperClassName)}>
      {hasImage ? (
        <img
          src={optimized!}
          alt={alt}
          loading="lazy"
          onError={() => setFailed(true)}
          className={cn('h-full w-full', objectFit === 'cover' ? 'object-cover' : 'object-contain', className)}
        />
      ) : (
        <Package className="h-1/3 w-1/3 text-line" aria-hidden />
      )}
    </div>
  );
}
