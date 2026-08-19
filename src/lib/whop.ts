/**
 * Server-only Whop SDK client singleton.
 *
 * WHOP_API_KEY is the company-level API key from the Whop dashboard
 * (Settings > Developer > API Keys), NOT the WHOP_WEBHOOK_SECRET (that
 * is a separate credential used only to verify inbound webhook
 * signatures — see src/lib/webhooks/whop/verify-signature.ts).
 */
import Whop from '@whop/sdk';

if (typeof window !== 'undefined') {
  throw new Error('src/lib/whop.ts must never be imported into client-side/browser code.');
}

export const whopClient = new Whop({
  apiKey: process.env.WHOP_API_KEY ?? '',
});

export const WHOP_COMPANY_ID = process.env.WHOP_COMPANY_ID ?? '';
