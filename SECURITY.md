# Security Policy

## Reporting a Vulnerability

If you discover a security vulnerability in Viableo, please report it
responsibly by emailing **witejackel@gmail.com** with the subject line
`[VULN] Viableo security report`.

Include:

- A description of the vulnerability.
- Steps to reproduce (or a proof-of-concept).
- The affected component(s) and version(s).
- Any potential impact.

You may encrypt your report with the following PGP key fingerprint if
you need confidentiality before disclosure:

```
(witejackel-eng PGP fingerprint placeholder — add after key generation)
```

**Please do not open a public GitHub issue for security vulnerabilities.**

### Response Timeline

| Timeframe | Action |
|---|---|
| Within 48 hours | Acknowledgment of receipt and initial triage. |
| Within 7 days | Assessment complete; confirmed or declined with rationale. |
| Within 90 days | Patch released for confirmed vulnerabilities (or coordinated disclosure date agreed). |

### Coordination

- We follow [Responsible Disclosure](https://en.wikipedia.org/wiki/Responsible_disclosure) principles.
- If the issue affects a shared dependency, we will coordinate with the upstream maintainer.
- Credit will be given in the release notes unless you request anonymity.

---

## Security Architecture

Viableo applies defense-in-depth at every layer:

### Authentication

- NextAuth v4 with GitHub and Google OAuth providers.
- Session tokens are signed JWTs stored in HTTP-only cookies.
- `NEXTAUTH_SECRET` must be a cryptographically random 32+ character value.
- Superadmin bootstrap uses a single-use token that must be rotated immediately.

### Authorization

- **Edge middleware** (`middleware.ts`): UX-level redirect for `/admin/**` routes.
  This is intentionally *not* the authorization decision — it is a convenience
  layer that can be bypassed.
- **Route-handler guards**: Every protected API route independently calls
  `requireAuth()`, `requireOrg()`, or `requireSuperAdmin()` from `src/lib/auth.ts`.
  These are the real authorization decisions.
- **Multi-tenant isolation**: All data queries include an `organizationId`
  filter. Cross-tenant isolation is tested (see `src/lib/tenant/__tests__/cross-tenant-isolation.test.ts`).
  Tests *fail loudly* if `TEST_DATABASE_URL` is not set — they never silently skip.

### Webhook Integrity

- Whop webhook events are verified via HMAC-SHA256 signature before
  processing. See `src/lib/webhooks/whop/verify-signature.ts`.

### Data Protection

- Database connection uses TLS (Neon default).
- `DEV_ENTITLEMENT_SECRET` and `DEBUG_PRISMA` must **never** be set in
  production (enforced by pre-launch checklist and deployment docs).
- No raw secrets are logged. SystemEvent and AuditLog tables use string
  IDs (not FK references) so high-volume logging cannot be blocked by a
  missing FK.

### Rate Limiting

- API routes use Upstash Redis-backed rate limiting (`src/lib/rate-limit.ts`).
- Degrades gracefully to in-memory limiting when Upstash is not configured.

### Dependency Management

- Dependencies are pinned via `bun.lock`.
- `bun install --frozen-lockfile` is used in CI and production builds.
- Run `bun audit` periodically to check for known vulnerabilities.

### Content Security

- PDF generation uses DOMPurify for HTML sanitization.
- User-supplied content rendered in React is not injected via `dangerouslySetInnerHTML`
  without sanitization.

---

## Supported Versions

| Version | Supported |
|---|---|
| 0.2.x | Yes |
| < 0.2.0 | No |
