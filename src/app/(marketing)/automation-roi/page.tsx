import { permanentRedirect } from 'next/navigation';

/**
 * /automation-roi → 308 permanent redirect → /
 *
 * Per the master directive: `/` is the canonical primary Automation ROI
 * landing page. `/automation-roi` must NOT remain as a second indexable
 * duplicate. A permanent (308) redirect consolidates link equity onto
 * the canonical homepage.
 *
 * No functionality depends on `/automation-roi` as a distinct route — the
 * homepage (`/`) renders the full Skydda-transplanted marketing experience.
 */
export default function AutomationRoiRedirectPage() {
  permanentRedirect('/');
}
