---
Task ID: 1
Agent: main
Task: Clone and set up the automation-roi project from GitHub

Work Log:
- Cloned the repository from https://github.com/witejackel-eng/automation-roi
- Analyzed the full project structure: Next.js 16, TypeScript, Tailwind CSS 4, shadcn/ui, Prisma SQLite, Zustand, Framer Motion, Recharts
- Copied all source files (88 new files) into /home/z/my-project:
  - src/lib/ (calculations, pdf, validation, brand, entitlement, store, format, etc.)
  - src/components/ (views, calculator, charts, marketing, viableo, ui)
  - src/hooks/
  - src/app/ (api routes, marketing pages, share pages)
  - prisma/schema.prisma
  - public/ (fonts, favicon, logo)
  - scripts/
- Installed missing dependencies: @fontsource/ibm-plex-mono, @fontsource/ibm-plex-sans, @fontsource/inter, @react-pdf/renderer, @swc/helpers, motion
- Pushed Prisma schema to SQLite database (Organization, Project, Report, Share, License models)
- Added missing site.webmanifest file
- Ran lint check - passed with no errors
- Started dev server and verified compilation:
  - GET / 200 (page renders correctly, 104KB HTML)
  - GET /api/entitlement 200 (API working)
  - Prisma queries executing correctly
  - Page title: "Viableo — Automation ROI | Know what's worth building."

Stage Summary:
- Project fully cloned and operational in /home/z/my-project
- All 88 source files copied, dependencies installed, database configured
- Page renders correctly with Viableo branding and all key components
- Dev server running on port 3000
- Ready for development work
