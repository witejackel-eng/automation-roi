# Task 5 — Fix dead links, favicon, nav improvements, beforeunload guard

## Summary
All 6 subtasks completed successfully with zero lint errors.

## Changes Made

### 1. Dead Login link removed from app-shell.tsx
- Removed `<a href="#" onClick={e.preventDefault()}>Login</a>` from desktop nav pill
- Updated comment referencing "Login" in nav description
- No Login link existed in mobile menu dropdown (confirmed)

### 2. Dead Login link removed from marketing-shell.tsx
- Removed identical dead `<a href="#">Login</a>` from desktop nav
- No Login link existed in mobile menu dropdown (confirmed)

### 3. Duplicate footer link removed from marketing-shell.tsx
- "Company" column had both "Methodology" and "How it works" linking to `/methodology`
- Removed "How it works" duplicate, keeping "Methodology"

### 4. Mobile tab bar active indicator dot added to app-shell.tsx
- Added a 4px (`size-1`) `bg-brand` rounded-full dot below the active tab's icon
- Wrapped icon + dot in a `flex-col items-center gap-0.5` div
- Dot is conditionally rendered only when `active` is true
- Uses `aria-hidden="true"` since it's decorative

### 5. Favicon PNGs generated
- Created `public/favicon-16.png` (16×16), `public/favicon-32.png` (32×32), `public/apple-touch-icon.png` (180×180)
- Used Python PIL to programmatically redraw the Viableo V-check + dot on rounded rect background (matching favicon.svg design)

### 6. beforeunload guard added to wizard.tsx
- Uses `formState.isDirty` from react-hook-form
- When dirty, attaches a `beforeunload` listener that calls `e.preventDefault()` and sets `e.returnValue = ''`
- Listener is removed when form is clean or on unmount

## Verification
- `bun run lint` — zero errors
- Dev server running, GET / 200
