import { useEffect, useState } from 'react';
import { ImagePlus, Loader2, Trash2 } from 'lucide-react';
import { cloudinaryService } from '@/services/cloudinary';
import { extractError } from '@/lib/api';
import { cn } from '@/lib/cn';

export interface UploadedImage {
  url: string | null;
  publicId?: string | null;
}

interface ImageUploaderProps {
  label?: string;
  value?: string | null;
  onChange: (img: { url: string | null; publicId?: string | null }) => void;
  folder?: string;
  aspect?: string;
  hint?: string;
}

export function ImageUploader({ label, value, onChange, folder = 'dukastock/storefront', aspect = 'aspect-video', hint }: ImageUploaderProps) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [configured, setConfigured] = useState<boolean | null>(null);

  useEffect(() => {
    cloudinaryService
      .config()
      .then((c) => setConfigured(c.configured))
      .catch(() => setConfigured(false));
  }, []);

  const onPickFile = async (file: File | undefined) => {
    if (!file) return;
    setBusy(true);
    setError(null);
      try {
        const result = await cloudinaryService.upload(file, folder);
      if (result.url) {
        onChange({ url: result.url, publicId: result.publicId });
      } else {
        setError(result.message ?? 'Could not upload image');
      }
    } catch (err) {
      setError(extractError(err).message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="w-full">
      {label && <label className="label">{label}</label>}
      {value ? (
        <div className="overflow-hidden rounded-lg border border-line bg-canvas">
          <div className={cn('w-full bg-line/30', aspect)}>
            <img src={value} alt="preview" className="h-full w-full object-cover" />
          </div>
          <div className="flex items-center gap-2 border-t border-line p-2">
            <label className="flex flex-1 cursor-pointer items-center justify-center gap-1.5 rounded-md px-2 py-1.5 text-xs font-medium text-brand hover:bg-primary-light">
              {busy ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <ImagePlus className="h-3.5 w-3.5" />}
              Replace
              <input type="file" accept="image/*" className="hidden" onChange={(e) => onPickFile(e.target.files?.[0])} />
            </label>
            <button
              type="button"
              onClick={() => onChange({ url: null, publicId: null })}
              className="flex items-center gap-1 rounded-md px-2 py-1.5 text-xs font-medium text-danger hover:bg-danger/5"
            >
              <Trash2 className="h-3.5 w-3.5" /> Remove
            </button>
          </div>
        </div>
      ) : (
        <div className="rounded-lg border border-dashed border-line bg-canvas/60 p-4">
          <div className="flex items-center gap-3">
            <label className="flex cursor-pointer items-center gap-1.5 rounded-md bg-brand px-3 py-2 text-xs font-medium text-white hover:bg-brand-dark">
              {busy ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <ImagePlus className="h-3.5 w-3.5" />}
              Upload image
              <input type="file" accept="image/*" className="hidden" onChange={(e) => onPickFile(e.target.files?.[0])} />
            </label>
            {configured === false && (
              <span className="text-xs text-muted">
                Cloudinary isn't configured — paste a URL instead.
              </span>
            )}
          </div>
          <input
            value={value ?? ''}
            onChange={(e) => onChange({ url: e.target.value || null, publicId: null })}
            placeholder="or paste an image URL"
            className="input mt-3"
          />
          {hint && <p className="mt-1 text-xs text-muted">{hint}</p>}
        </div>
      )}
      {error && <p className="mt-1 text-xs text-danger">{error}</p>}
    </div>
  );
}
