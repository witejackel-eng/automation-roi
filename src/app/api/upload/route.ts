/**
 * POST /api/upload — logo upload (agency+).
 *
 * Validates MIME type and file size (<= 2MB) server-side (Section 24).
 *
 * - Production (BLOB_READ_WRITE_TOKEN set): uploads to Vercel Blob and returns
 *   the blob URL for efficient CDN-served storage.
 * - Development: returns a data: URL so the PDF renderer and Organization.logoUrl
 *   can reference it directly without any cloud credentials.
 */
import { NextRequest, NextResponse } from 'next/server';
import { getDemoOrganization } from '@/lib/session';
import { getActiveEntitlement, has } from '@/lib/entitlement';
import { storeImage } from '@/lib/storage';

export const runtime = 'nodejs';

const MAX_BYTES = 2 * 1024 * 1024; // 2MB
const ALLOWED = ['image/png', 'image/jpeg', 'image/webp', 'image/svg+xml'];

export async function POST(req: NextRequest) {
  const org = await getDemoOrganization();
  const entitlement = await getActiveEntitlement(org.id);
  if (!has(entitlement, 'agency_branding')) {
    return NextResponse.json(
      { error: 'Logo upload requires Agency or higher.', requiredTier: 'agency' },
      { status: 403 }
    );
  }

  const form = await req.formData();
  const file = form.get('file');
  if (!(file instanceof File)) {
    return NextResponse.json({ error: 'No file uploaded.' }, { status: 422 });
  }
  if (!ALLOWED.includes(file.type)) {
    return NextResponse.json(
      { error: 'Logo must be PNG, JPEG, WebP, or SVG.' },
      { status: 422 }
    );
  }
  if (file.size > MAX_BYTES) {
    return NextResponse.json({ error: 'Logo must be 2MB or smaller.' }, { status: 422 });
  }

  const buf = Buffer.from(await file.arrayBuffer());

  // Use the storage abstraction — Vercel Blob in production, data: URI in dev
  const ext = file.type.split('/')[1]?.replace('svg+xml', 'svg') ?? 'png';
  const fileName = `${org.id}/logo-${Date.now()}.${ext}`;
  const stored = await storeImage(fileName, buf, file.type);

  return NextResponse.json({ url: stored.url, size: buf.length });
}
