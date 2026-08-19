'use client';

/**
 * Settings view — agency branding (Section 16).
 *
 * The brand color replaces --color-brand ONLY inside the generated PDF, never
 * inside the live app UI. So the live form always uses the fixed design system,
 * and the brand color preview swatch shows what the PDF will look like.
 */
import * as React from 'react';
import { useShallow } from 'zustand/react/shallow';
import { Upload, Check, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useApp } from '@/lib/store';
import { useToast } from '@/hooks/use-toast';
import { has } from '@/lib/entitlement';
import { cn } from '@/lib/utils';
import { TERM } from '@/lib/brand';

// The Viableo coral — the default agency brand color when none has been set.
// (Previously the "ledger blue" default; updated for the Viableo rebrand.)
const DEFAULT_BRAND_COLOR = '#FF164B';

interface BrandingForm {
  name: string;
  website: string;
  contactEmail: string;
  phone: string;
  logoUrl: string;
  brandColorHex: string;
}

export function SettingsView() {
  const { entitlement, setBranding } = useApp(
    useShallow((s) => ({
      entitlement: s.entitlement,
      setBranding: s.setBranding,
    }))
  );
  const { toast } = useToast();
  const [form, setForm] = React.useState<BrandingForm>({
    name: '',
    website: '',
    contactEmail: '',
    phone: '',
    logoUrl: '',
    brandColorHex: '',
  });
  const [loading, setLoading] = React.useState(true);
  const [saving, setSaving] = React.useState(false);
  const [errors, setErrors] = React.useState<Record<string, string>>({});
  const [uploading, setUploading] = React.useState(false);
  const fileRef = React.useRef<HTMLInputElement>(null);

  const canBrand = !!entitlement && has(entitlement, 'agency_branding');

  React.useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch('/api/organizations');
        if (!res.ok) return;
        const data = (await res.json()) as BrandingForm;
        if (!cancelled) {
          setForm(data);
          setBranding(data);
        }
      } catch {
        /* ignore */
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [setBranding]);

  const handleSave = async () => {
    setSaving(true);
    setErrors({});
    try {
      const res = await fetch('/api/organizations', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (res.status === 403) {
        toast({
          title: 'Agency branding requires Agency or higher.',
          description: 'The other fields are still saved.',
          variant: 'destructive',
        });
        return;
      }
      if (!res.ok) {
        const data = (await res.json().catch(() => ({}))) as { issues?: Record<string, string[]>; error?: string };
        if (data.issues) {
          const map: Record<string, string> = {};
          for (const [k, v] of Object.entries(data.issues)) {
            if (Array.isArray(v) && v.length > 0) map[k] = v[0];
          }
          setErrors(map);
        }
        toast({ title: data.error ?? 'Could not save settings.', variant: 'destructive' });
        return;
      }
      const data = (await res.json()) as BrandingForm;
      setForm(data);
      setBranding(data);
      toast({ title: 'Settings saved.' });
    } catch {
      toast({ title: 'Could not reach the service.', variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  const handleUpload = async (file: File) => {
    if (!canBrand) {
      toast({ title: 'Logo upload requires Agency or higher.', variant: 'destructive' });
      return;
    }
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append('file', file);
      const res = await fetch('/api/upload', { method: 'POST', body: fd });
      if (res.status === 403) {
        toast({ title: 'Logo upload requires Agency or higher.', variant: 'destructive' });
        return;
      }
      if (!res.ok) {
        const data = (await res.json().catch(() => ({}))) as { error?: string };
        toast({ title: data.error ?? 'Could not upload logo.', variant: 'destructive' });
        return;
      }
      const data = (await res.json()) as { url: string };
      setForm((f) => ({ ...f, logoUrl: data.url }));
      toast({ title: 'Logo uploaded.' });
    } catch {
      toast({ title: 'Could not upload logo.', variant: 'destructive' });
    } finally {
      setUploading(false);
    }
  };

  if (loading) {
    return (
      <div className="mx-auto w-full max-w-[800px] px-4 py-12 md:px-6">
        <div className="h-7 w-1/3 animate-pulse rounded bg-surface" />
        <div className="mt-6 space-y-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-10 animate-pulse rounded bg-surface" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-[800px] px-4 py-12 md:px-6">
      <header className="mb-8">
        <h1 className="font-display text-[28px] font-bold leading-[1.02] tracking-[-0.02em] text-ink">
          Agency settings
        </h1>
        <p className="mt-1 text-[15px] text-ink-muted">
          Branding appears on every {TERM.businessCase}. The live app always uses its own design
          system.
        </p>
      </header>

      {!canBrand && (
        <div className="mb-6 flex items-start gap-3 rounded-lg border border-border bg-surface p-4">
          <AlertCircle className="mt-0.5 size-4 shrink-0 text-ink-muted" strokeWidth={1.75} aria-hidden="true" />
          <div className="text-[13px] text-ink-muted">
            <p>Logo upload and brand color require the <span className="font-medium text-ink">Agency</span> tier or higher. Other fields save on any tier.</p>
          </div>
        </div>
      )}

      <div className="space-y-6 rounded-lg border border-border bg-surface-raised p-6">
        <Field label="Agency name" htmlFor="name" error={errors.name}>
          <Input
            id="name"
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            placeholder="Apex Automation Studio"
            className="bg-canvas"
          />
        </Field>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <Field label="Website" htmlFor="website" error={errors.website}>
            <Input
              id="website"
              value={form.website}
              onChange={(e) => setForm((f) => ({ ...f, website: e.target.value }))}
              placeholder="https://example.com"
              className="bg-canvas"
            />
          </Field>
          <Field label="Contact email" htmlFor="contactEmail" error={errors.contactEmail}>
            <Input
              id="contactEmail"
              type="email"
              value={form.contactEmail}
              onChange={(e) => setForm((f) => ({ ...f, contactEmail: e.target.value }))}
              placeholder="hello@example.com"
              className="bg-canvas"
            />
          </Field>
        </div>

        <Field label="Phone" htmlFor="phone" error={errors.phone}>
          <Input
            id="phone"
            value={form.phone}
            onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
            placeholder="+1 (555) 000-0000"
            className="bg-canvas"
          />
        </Field>

        {/* Logo upload — agency+ */}
        <Field
          label="Logo"
          htmlFor="logo"
          error={errors.logoUrl}
          help={canBrand ? 'PNG, JPEG, WebP, or SVG. 2MB or smaller.' : 'Requires Agency tier.'}
        >
          <div className="flex items-center gap-4">
            <div className="flex size-16 items-center justify-center overflow-hidden rounded-sm border border-border bg-surface">
              {form.logoUrl ? (
                <img src={form.logoUrl} alt="Agency logo preview" className="size-full object-contain" />
              ) : (
                <span className="font-display text-[18px] font-semibold text-ink-muted">
                  {form.name?.[0]?.toUpperCase() ?? 'A'}
                </span>
              )}
            </div>
            <Button
              type="button"
              variant="secondary"
              onClick={() => fileRef.current?.click()}
              disabled={!canBrand || uploading}
              className="gap-1.5 border-border bg-surface-raised text-ink hover:bg-surface"
            >
              <Upload className="size-4" strokeWidth={1.75} aria-hidden="true" />
              {uploading ? 'Uploading…' : 'Upload logo'}
            </Button>
            <input
              ref={fileRef}
              type="file"
              accept="image/png,image/jpeg,image/webp,image/svg+xml"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) handleUpload(f);
                e.target.value = '';
              }}
            />
          </div>
        </Field>

        {/* Brand color — agency+ */}
        <Field
          label="Brand color"
          htmlFor="brandColorHex"
          error={errors.brandColorHex}
          help={canBrand ? `Replaces the Viableo coral inside the generated PDFs only. The live app is unchanged.` : 'Requires Agency tier.'}
        >
          <div className="flex items-center gap-3">
            <input
              type="color"
              id="brandColorHex"
              value={form.brandColorHex || DEFAULT_BRAND_COLOR}
              onChange={(e) => setForm((f) => ({ ...f, brandColorHex: e.target.value.toUpperCase() }))}
              disabled={!canBrand}
              className="size-10 cursor-pointer rounded-sm border border-border bg-canvas disabled:cursor-not-allowed"
              aria-label="Pick a brand color"
            />
            <Input
              value={form.brandColorHex}
              onChange={(e) => setForm((f) => ({ ...f, brandColorHex: e.target.value }))}
              placeholder={DEFAULT_BRAND_COLOR}
              disabled={!canBrand}
              className="w-40 font-mono tnum bg-canvas"
              aria-label="Brand color hex"
            />
            <div
              className="size-10 rounded-sm border border-border"
              style={{ backgroundColor: form.brandColorHex || DEFAULT_BRAND_COLOR }}
              aria-hidden="true"
            />
          </div>
        </Field>

        <div className="flex items-center justify-end gap-3 border-t border-border pt-4">
          <Button
            onClick={handleSave}
            disabled={saving}
            className="gap-1.5 bg-brand-cta text-white hover:bg-brand-cta-hover"
          >
            {saving ? (
              <>Saving…</>
            ) : (
              <>
                <Check className="size-4" strokeWidth={1.75} aria-hidden="true" />
                Save settings
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}

function Field({
  label,
  htmlFor,
  error,
  help,
  children,
}: {
  label: string;
  htmlFor: string;
  error?: string;
  help?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <Label htmlFor={htmlFor} className="mb-1.5 text-[13px] text-ink-muted">
        {label}
      </Label>
      {children}
      {help && <p className="mt-1.5 text-[12px] text-ink-faint">{help}</p>}
      {error && (
        <p className="mt-1.5 text-[12px] text-dont-build" role="alert" aria-live="polite">
          {error}
        </p>
      )}
    </div>
  );
}
