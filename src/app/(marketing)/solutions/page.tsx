import { redirect } from 'next/navigation';

/**
 * /solutions redirects to /solutions/automation-agencies.
 * No standalone /solutions page exists.
 */
export default function SolutionsRedirectPage() {
  redirect('/solutions/automation-agencies');
}
