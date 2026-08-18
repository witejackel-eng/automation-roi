/**
 * GET/PATCH /api/organizations — read + update agency branding.
 * The brand color replaces --color-brand ONLY inside the generated PDF,
 * never inside the live app UI (Section 16).
 */
import { NextRequest, NextResponse } from 'next/server';
import { requireOrg, AuthError } from '@/lib/session';
import { tenant, getOrgEntitlement } from '@/lib/tenant';
import { has } from '@/lib/entitlement';
import { organizationSchema } from '@/lib/validation/schema';

export const runtime = 'nodejs';

export async function GET() {
  try {
  const org = await requireOrg();
  return NextResponse.json({
    id: org.id,
    name: org.name,
    website: org.website ?? '',
    contactEmail: org.contactEmail ?? '',
    phone: org.phone ?? '',
    logoUrl: org.logoUrl ?? '',
    brandColorHex: org.brandColorHex ?? '',
  });
  } catch (e) {
    if (e instanceof AuthError) return NextResponse.json({ error: e.message }, { status: e.status });
    throw e;
  }
}

export async function PATCH(req: NextRequest) {
  try {
  const org = await requireOrg();
  const entitlement = await getOrgEntitlement(org.id);

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Request body must be valid JSON.' }, { status: 422 });
  }

  // Allow updating the non-branding fields (name/website/email/phone) at Pro+.
  // Agency branding (logoUrl + brandColorHex) requires agency+.
  const hasBrandingFields =
    typeof body === 'object' && body !== null && ('logoUrl' in body || 'brandColorHex' in body);

  if (hasBrandingFields && !has(entitlement, 'agency_branding')) {
    return NextResponse.json(
      { error: 'Agency branding requires Agency or higher.', requiredTier: 'agency' },
      { status: 403 }
    );
  }

  const parsed = organizationSchema.safeParse(body);
  if (!parsed.success) {
    const issues: Record<string, string[]> = {};
    for (const issue of parsed.error.issues) {
      const key = issue.path.join('.') || '_';
      (issues[key] ??= []).push(issue.message);
    }
    return NextResponse.json({ error: 'Validation failed.', issues }, { status: 422 });
  }

  const data = {
    name: parsed.data.name,
    website: parsed.data.website || null,
    contactEmail: parsed.data.contactEmail || null,
    phone: parsed.data.phone || null,
    ...(has(entitlement, 'agency_branding')
      ? { logoUrl: parsed.data.logoUrl || null, brandColorHex: parsed.data.brandColorHex || null }
      : {}),
  };

  const updated = await tenant(org.id).organization.update({ data });
  return NextResponse.json({
    id: updated.id,
    name: updated.name,
    website: updated.website ?? '',
    contactEmail: updated.contactEmail ?? '',
    phone: updated.phone ?? '',
    logoUrl: updated.logoUrl ?? '',
    brandColorHex: updated.brandColorHex ?? '',
  });
  } catch (e) {
    if (e instanceof AuthError) return NextResponse.json({ error: e.message }, { status: e.status });
    throw e;
  }
}
