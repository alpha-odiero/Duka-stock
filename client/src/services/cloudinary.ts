import { api } from '@/lib/api';

export interface CloudinaryConfig {
  configured: boolean;
  cloudName: string | null;
}

export interface UploadResult {
  url?: string;
  publicId?: string;
  configured?: boolean;
  message?: string;
}

export function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(reader.error ?? new Error('Could not read image'));
    reader.readAsDataURL(file);
  });
}

export const cloudinaryService = {
  async config(): Promise<CloudinaryConfig> {
    const res = await api.get('/cloudinary/config');
    return res.data.data;
  },
  async upload(file: File, folder = 'dukastock/products'): Promise<UploadResult> {
    const dataUrl = await readFileAsDataUrl(file);
    const res = await api.post('/cloudinary/upload', { dataUrl, folder });
    return res.data.data;
  },
};
