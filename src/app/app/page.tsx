import { redirect } from 'next/navigation';

/**
 * /app is deprecated. No /app/** routes exist (the authenticated workspace
 * was never built). Redirect to /start — the new public client route — so
 * stale links and old middleware references don't dead-end at a 404 or a
 * signin loop (mandate P0-10).
 *
 * A route-based redirect is more reliable than the middleware redirect for
 * the /app path specifically (Next.js 16 reserves /app as the App Router
 * source dir name; the edge middleware redirect for /app was not firing
 * reliably in dev). This page handles /app; the sibling [...slug] page
 * handles /app/anything.
 */
export default function AppRedirectPage() {
  redirect('/start?start=1');
}
