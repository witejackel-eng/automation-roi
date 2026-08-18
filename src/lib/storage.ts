/**
 * Storage abstraction — Vercel Blob with local-filesystem fallback.
 *
 * In production (Vercel), files are stored in Vercel Blob with BLOB_READ_WRITE_TOKEN.
 * In development, files fall back to the local public/ directory so the dev
 * server can serve them directly without any cloud credentials.
 *
 * Section 5 of the production mandate: "Move file storage to Vercel Blob."
 */
import { put } from '@vercel/blob';
import { promises as fs } from 'node:fs';
import path from 'node:path';

const REPORTS_DIR = path.join(process.cwd(), 'public', 'reports');

export interface StoredFile {
  /** Absolute or relative URL that the client can use to access the file. */
  url: string;
  /** Whether the file was stored in Vercel Blob (true) or local FS (false). */
  isBlob: boolean;
}

/**
 * Store a PDF buffer. Returns a URL the client can open.
 *
 * - Production: uploads to Vercel Blob → returns the blob URL
 * - Development fallback: writes to public/reports/ → returns a relative path
 */
export async function storePdf(
  fileName: string,
  buffer: Buffer,
): Promise<StoredFile> {
  if (process.env.BLOB_READ_WRITE_TOKEN) {
    const blob = await put(`reports/${fileName}`, buffer, {
      access: 'public',
      contentType: 'application/pdf',
    });
    return { url: blob.url, isBlob: true };
  }

  // Dev fallback: write to public/reports/
  await fs.mkdir(REPORTS_DIR, { recursive: true });
  const filePath = path.join(REPORTS_DIR, fileName);
  await fs.writeFile(filePath, buffer);
  return { url: `/reports/${fileName}`, isBlob: false };
}

/**
 * Store an image file (logo upload). Returns a URL for the image.
 *
 * - Production: uploads to Vercel Blob → returns the blob URL
 * - Development fallback: returns a data: URI (preserves existing behavior)
 */
export async function storeImage(
  fileName: string,
  buffer: Buffer,
  mimeType: string,
): Promise<StoredFile> {
  if (process.env.BLOB_READ_WRITE_TOKEN) {
    const blob = await put(`logos/${fileName}`, buffer, {
      access: 'public',
      contentType: mimeType,
    });
    return { url: blob.url, isBlob: true };
  }

  // Dev fallback: return data: URI (existing behavior)
  const dataUrl = `data:${mimeType};base64,${buffer.toString('base64')}`;
  return { url: dataUrl, isBlob: false };
}
