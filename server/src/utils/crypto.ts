import crypto from 'crypto';
import { env } from '../config/env';

// Deterministic encryption/decryption for API integration secrets at rest.
// Uses AES-256-GCM with a key derived from the session secret, producing a
// base64 "iv:tag:ciphertext" blob. Full secrets never leave the server — only
// a masked preview is ever returned to the frontend.

const keyMaterial = env.sessionSecret;
function deriveKey(): Buffer {
  return crypto.createHash('sha256').update(keyMaterial).digest();
}

const ALGO = 'aes-256-gcm';

export function encryptSecret(plaintext: string): string {
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv(ALGO, deriveKey(), iv);
  const enc = Buffer.concat([cipher.update(plaintext, 'utf8'), cipher.final()]);
  const tag = cipher.getAuthTag();
  return `${iv.toString('base64')}:${tag.toString('base64')}:${enc.toString('base64')}`;
}

export function decryptSecret(blob: string): string {
  const [ivB, tagB, dataB] = blob.split(':');
  if (!ivB || !tagB || !dataB) throw new Error('Invalid encrypted secret format');
  const decipher = crypto.createDecipheriv(ALGO, deriveKey(), Buffer.from(ivB, 'base64'));
  decipher.setAuthTag(Buffer.from(tagB, 'base64'));
  const dec = Buffer.concat([decipher.update(Buffer.from(dataB, 'base64')), decipher.final()]);
  return dec.toString('utf8');
}

// Returns a masked preview of a secret, e.g. "••••••••••••A92X".
export function maskSecret(plaintext: string): string {
  const visible = Math.min(4, plaintext.length);
  const tail = plaintext.slice(-visible);
  const dots = '•'.repeat(Math.max(8, plaintext.length - visible + 4));
  return `${dots}${tail}`;
}
