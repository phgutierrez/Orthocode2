# CONTEXT

## Product Summary
OrthoCode 2.0 is a PWA/mobile-focused app for orthopedic procedure codes (TUSS/CBHPM/SUS). Core goals: fast lookup, favorites, and reusable packages (standard and private), plus sharing.

## Stack
- React + TypeScript + Vite
- UI: shadcn/ui + Tailwind CSS
- Data fetching: @tanstack/react-query
- Backend: Supabase (Auth + Postgres)
- PWA: vite-plugin-pwa

## Key User Flows
- Search procedures and open details.
- Favorite procedures and list favorites.
- Create/manage packages (standard and private).
- Private packages support values (surgeon/anesthetist/assistant) and OPME selection.
- Share packages via notifications.

## Important Files
- App routes: [src/App.tsx](src/App.tsx)
- Auth + profile sync: [src/contexts/AuthContext.tsx](src/contexts/AuthContext.tsx)
- Procedures data + search: [src/data/procedures.ts](src/data/procedures.ts)
- Procedures hook (react-query): [src/hooks/useProcedures.ts](src/hooks/useProcedures.ts)
- Favorites: [src/hooks/useFavorites.ts](src/hooks/useFavorites.ts)
- Packages page: [src/pages/Packages.tsx](src/pages/Packages.tsx)
- Packages hooks: [src/hooks/usePackages.ts](src/hooks/usePackages.ts), [src/hooks/usePrivatePackages.ts](src/hooks/usePrivatePackages.ts)
- OPME hook: [src/hooks/useOpmes.ts](src/hooks/useOpmes.ts)
- Sharing logic: [src/hooks/usePackageSharing.ts](src/hooks/usePackageSharing.ts)
- Notifications hook + modal: [src/hooks/useNotifications.ts](src/hooks/useNotifications.ts), [src/pages/packages/NotificationsModal.tsx](src/pages/packages/NotificationsModal.tsx)
- OPME selection modal: [src/pages/packages/OpmeSelectModal.tsx](src/pages/packages/OpmeSelectModal.tsx)

## Data Model (Front-end)
- Procedure: `id`, `codes`, `values`, `region`, `type`, `porte`, `anestheticPort`, `cids`, `keywords`.
- Package (standard): `name`, `description`, `procedureIds`.
- Package (private): adds `surgeonValue`, `anesthetistValue`, `assistantValue`, `opmeIds`.

## Database / SQL Setup
Run in Supabase SQL Editor (order):
1. [docs/sql/SHARE_SETUP.sql](docs/sql/SHARE_SETUP.sql) — shared_packages + notifications (+ RLS)
2. [docs/sql/USER_RLS_FIX.sql](docs/sql/USER_RLS_FIX.sql) — users select policy
3. [docs/sql/PACKAGE_PROCEDURES_RLS.sql](docs/sql/PACKAGE_PROCEDURES_RLS.sql) — shared package procedures
4. [docs/sql/private-packages-opme.sql](docs/sql/private-packages-opme.sql) — opmes + private packages (needs RLS policies)

## Security Notes (Supabase Linter)
- RLS must be enabled on: `opmes`, `private_packages`, `private_package_procedures`, `private_package_opmes`.
- `notifications` insert policy in SHARE_SETUP is permissive; should be restricted.
- Leaked password protection should be enabled in Supabase Auth console.

## Performance Notes
- Procedure lists in Packages create tabs use batching + IntersectionObserver (selected items pinned at top).
- ProcedureCard is memoized to reduce re-rendering.

## Env
- `.env.local` needs `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`.

## Commands
- `npm install`
- `npm run dev`
- `npm run build`
- `npm run lint`
- `npm run test`