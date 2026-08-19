import { redirect } from 'next/navigation';

/**
 * Catch-all redirect for /app/** — any sub-path under /app redirects to /start.
 * See src/app/app/page.tsx for the rationale.
 */
export default function AppCatchAllRedirectPage() {
  redirect('/start?start=1');
}
