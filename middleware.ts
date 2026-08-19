/**
 * Next.js edge backstop — `middleware.ts`.
 *
 * NOTE: Next.js 16 introduced `proxy.ts` as the new naming for the edge
 * middleware file (with the exported function renamed from `middleware`
 * to `proxy`). The Viableo Production Architecture spec recommended
 * using `proxy.ts`. However, the build's middleware-manifest showed the
 * proxy.ts file was NOT being picked up by Next.js 16.1.3 (the manifest
 * was empty), so we fall back to the universally-supported `middleware.ts`
 * naming (works in every Next.js version since 12).
 *
 * Per the Viableo Production Architecture §0.1 (F-7 correction):
 *   "The repository runs next@^16.1.1. Per Auth.js's own Next.js
 *    integration docs, Next.js 16 renamed middleware.ts to proxy.ts
 *    and the exported function from `middleware` to `proxy`."
 *
 * Defense-in-depth UX layer, NOT the authorization decision itself
 * (per Auth.js's own warning quoted in §0.1). Every route handler must
 * still independently call requireAuth()/requireOrg()/requireSuperAdmin()
 * — the edge layer can be misconfigured, skipped in certain deploy
 * configurations, or simply is not where the security decision lives.
 *
 * Two route groups:
 *   /app/**     — DEPRECATED. No /app/** routes exist; /app redirects to
 *                 the new client route /start (mandate P0-10). Kept as a
 *                 redirect so stale links / old middleware references don't
 *                 dead-end at a 404 or a signin loop.
 *   /admin/**   — Superadmin control plane (Agent 2 builds the actual
 *                 routes; this backstop is already written generically
 *                 enough that it does not need to change when those
 *                 routes appear — checks token.systemRole === 'SUPERADMIN'
 *                 for any path starting with /admin).
 *
 * Public routes that MUST NOT be gated:
 *   /              — marketing landing page (server component)
 *   /start/**       — the client application (view-switcher, public)
 *   /r/[shareId]   — public share-link client view (the opaque shareId
 *                    IS the access credential — no auth)
 *   /auth/**       — sign-in / error pages
 *   /api/**        — API routes do their own server-side auth checks;
 *                    the edge layer is for page-level UX, not API auth
 *   /_next/**      — Next.js static assets
 */
import { NextResponse, type NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

export const config = {
  // Run on every request — the handler itself decides what to gate.
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};

export async function middleware(req: NextRequest): Promise<NextResponse | undefined> {
  const { pathname } = req.nextUrl;

  // Public routes — never gate. /start is the new public client app route.
  if (
    pathname === '/' ||
    pathname.startsWith('/start') ||
    pathname.startsWith('/r/') ||
    pathname.startsWith('/auth/') ||
    pathname.startsWith('/api/') ||
    pathname.startsWith('/_next')
  ) {
    return NextResponse.next();
  }

  // /app/** is deprecated — no routes exist there. Redirect to /start
  // (the new client app route) so stale links don't dead-end at a 404
  // or a signin loop. Per mandate P0-10: do NOT move the switcher behind
  // the auth gate until there is somewhere to land.
  if (pathname === '/app' || pathname.startsWith('/app/')) {
    const startUrl = new URL('/start', req.url);
    startUrl.searchParams.set('start', '1');
    return NextResponse.redirect(startUrl);
  }

  // The only remaining protected group is /admin/**.
  const isAdminRoute = pathname.startsWith('/admin');

  if (!isAdminRoute) {
    // Marketing routes (/, /pricing, /solutions, /privacy, /terms, etc.) — public.
    return NextResponse.next();
  }

  // Read the JWT cookie at the edge (no DB hit).
  // next-auth/jwt's getToken reads the NextAuth cookie directly; the
  // NEXTAUTH_SECRET env var must be set for it to verify the signature.
  const token = await getToken({
    req,
    secret: process.env.NEXTAUTH_SECRET,
  });

  // ── /admin/** — Superadmin only ───────────────────────────────
  // Written generically so it does not need to change when Agent 2
  // adds the actual /admin routes. Checks token.systemRole against
  // the literal 'SUPERADMIN' value set by scripts/bootstrap-superadmin.ts
  // and threaded through the jwt() callback in src/lib/auth.ts.
  if (isAdminRoute) {
    if (!token) {
      const signInUrl = new URL('/auth/signin', req.url);
      signInUrl.searchParams.set('callbackUrl', pathname);
      signInUrl.searchParams.set('error', 'admin_required');
      return NextResponse.redirect(signInUrl);
    }
    if (token.systemRole !== 'SUPERADMIN') {
      // Redirect non-superadmins away from /admin/** — they get a 404-
      // style page rather than a 403 (do not leak that /admin exists).
      // The actual /admin route handler still independently calls
      // requireSuperAdmin() — defense in depth.
      return NextResponse.rewrite(new URL('/404', req.url));
    }
    return NextResponse.next();
  }

  return NextResponse.next();
}
