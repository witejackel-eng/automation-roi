# Pre-Launch Checklist

Reproduced from the Viableo Final Production Audit. Each item is marked `[x]` if addressed by the five-prompt Zai remediation sequence, or `[ ]` with an explanation if it remains open.

## Infrastructure

- [x] 1. Postgres/Neon database is live and migrations apply cleanly in production. *(Prompt 1, Task 1.1)*
- [x] 2. Every real user gets an Organization + owner Membership automatically on first GitHub OAuth sign-in. *(Prompt 1, Task 1.5)*
- [x] 3. `/api/entitlement` and `/api/projects` return 200 (no more 500s). *(Prompt 1, Task 1.8)*
- [x] 4. `NEXTAUTH_SECRET` is explicitly set in authOptions. *(Prompt 1, Task 1.9)*
- [x] 5. `vercel.json` buildCommand runs `prisma migrate deploy` before `next build`. *(Prompt 1, Task 1.1)*

## Billing & Entitlements

- [x] 6. Real Whop checkout wired into pricing page. *(Prompt 2, Task 2.5)*
- [x] 7. Entitlement `Tier` type reconciled: `free | case_pack | agency | agency_pro`. *(Prompt 2, Task 2.1)*
- [x] 8. Webhook handler covers full lifecycle (activation, deactivation, refund). *(Prompt 2, Task 2.7)*
- [x] 9. Out-of-order webhook protection via `lastWebhookEventAt`. *(Prompt 2, Task 2.8)*
- [x] 10. Dev-only entitlement override route hard-blocked in production. *(Prompt 2, Task 2.6)*

## Core Product

- [x] 11. Output-consistency test and runtime integrity guard for report/proposal generation. *(Prompt 3, Task 3.1)*
- [x] 12. PATCH project endpoint with server-derived recommendation. *(Prompt 3, Task 3.3)*
- [x] 13. Autosave/draft recovery for calculator wizard. *(Prompt 3, Task 3.3)*
- [x] 14. Global `not-found.tsx` and `error.tsx` with branded states. *(Prompt 3, Task 3.4)*
- [x] 15. Share-link expiration and transactional approval writes. *(Prompt 3, Task 3.5)*
- [x] 16. `scripts/guard-protected-files.sh` regression guard. *(Prompt 3, Task 3.6)*

## Security & Hardening

- [x] 17. Two-organization cross-tenant isolation test suite (data + API layer). *(Prompt 4, Task 4.1)*
- [x] 18. `getOrgEntitlement` routed through `tenant()` wrapper. *(Prompt 4, Task 4.2)*
- [x] 19. CSP `frame-src` and `connect-src` for Whop checkout embed. *(Prompt 4, Task 4.2)*
- [x] 20. `requireSuperAdmin()` enforced on every `/api/admin/**` route and admin page. *(Prompt 4, Task 4.3)*
- [x] 21. Static-analysis admin-authz regression test. *(Prompt 4, Task 4.3)*
- [x] 22. SystemEvent coverage for report/proposal/share failures. *(Prompt 4, Task 4.4)*
- [x] 23. SVG upload sanitization (DOMPurify). *(Prompt 4, Task 4.5)*
- [x] 24. PDF filename hardened with random UUID. *(Prompt 4, Task 4.5)*
- [x] 25. Share-view rate limiting (Upstash Redis, no-op-safe). *(Prompt 4, Task 4.5)*
- [x] 26. QA replay endpoint hard-gated with `ENABLE_QA_ENDPOINTS`. *(Prompt 4, Task 4.5)*
- [x] 27. AI routes timeout-bounded, fail cleanly, architecturally isolated from calculations. *(Prompt 4, Task 4.6)*

## Launch Readiness

- [x] 28. Metadata base-URL fallback centralized on one value (`automation-roi-delta.vercel.app`). *(Prompt 5, Task 5.1)*
- [x] 29. `/favicon.ico` route serves 32x32 PNG (no 404). *(Prompt 5, Task 5.1)*
- [x] 30. Pricing figures consistent site-wide, sourced from `brand.ts`. *(Prompt 5, Task 5.2)*
- [x] 31. Duplicate `scripts/seed.ts` removed; `prisma/seed.ts` is sole canonical. *(Prompt 5, Task 5.3)*
- [x] 32. `package.json` name is `"viableo"`. *(Prompt 5, Task 5.3)*
- [x] 33. No committed real secrets found. *(Prompt 5, Task 5.3)*
- [x] 34. GitHub Actions CI workflow exists (`.github/workflows/ci.yml`). *(Prompt 5, Task 5.4)*
- [x] 35. `scripts/certify.ts` extended to 8 gates (tenant-isolation, output-consistency, E2E). *(Prompt 5, Task 5.4)*
- [x] 36. Playwright E2E scaffold (`playwright.config.ts` + `e2e/smoke.spec.ts`). *(Prompt 5, Task 5.4/5.7)*
- [x] 37. Deployment and rollback procedure documented. *(Prompt 5, Task 5.5)*
- [x] 38. Skip-to-content link added for accessibility. *(Prompt 5, Task 5.6)*
- [x] 39. WCAG contrast ratio computed (3.68:1 for brand coral on canvas — documented, compliant for large text only). *(Prompt 5, Task 5.6)*
- [x] 40. Font loading confirmed via `next/font/google`. *(Prompt 5, Task 5.6)*

## Remaining Human Actions (not automatable)

- [ ] Set `NEXT_PUBLIC_SITE_URL` in Vercel to the live domain. *(Human Runbook, Step 2)*
- [ ] Configure Vercel to wait for GitHub Actions CI before deploying. *(Human Runbook, Step 3)*
- [ ] Add GitHub Actions repository secrets (test DB, test credentials). *(Human Runbook, Step 4)*
- [ ] Optionally purchase and attach a custom domain. *(Human Runbook, Step 1)*
- [ ] Optionally provision Upstash Redis for rate limiting. *(Prompt 4 Runbook, Step 1)*