# Orthiva web — architecture

Next.js 16 (App Router) + TypeScript, organised **by feature**. The folder tree *is* the
architecture, and ESLint enforces it (`eslint.config.mjs`, rule `no-restricted-imports`).

```
src/
├── app/[locale]/            Routes and layouts only. Thin: compose feature hooks + components.
│   ├── (app)/layout.tsx     Auth guard + onboarding redirect + AppShell
│   ├── (app)/doctor/**      /doctor/patients, /doctor/clinics, /doctor/orders[/new|/[id]]
│   ├── (app)/lab/**         /lab/orders[/[id]]
│   ├── (app)/patient/**     /patient/treatment
│   └── (app)/admin/**       /admin/users
├── features/                One folder per business capability (mirrors the core's Modulith modules)
│   ├── identity/            me, onboarding, profile, staff (admin)
│   ├── patients/            patients CRUD + patient portal (my doctors)
│   ├── clinics/             clinics CRUD
│   ├── orders/              prescriptions / treatment orders, state badge, timeline
│   ├── planning/            treatment plans (lab)
│   └── payments/            payments of an order, mock gateway
└── shared/                  Cross-cutting, business-agnostic code
    ├── api/                 client.ts (fetch + ApiError), errors.ts (useApiErrorToast)
    ├── auth/                OIDC provider (react-oidc-context), getAccessToken()
    ├── query/               TanStack Query provider, useApi()
    ├── i18n/                next-intl routing / navigation / request config
    ├── layout/              AppShell (header, nav by role), LanguageSwitcher
    ├── media/               MediaPanel (upload/gallery for any owner) + Media types
    ├── ui/                  shadcn components (Base UI)
    └── lib/                 utils (cn), dates
messages/                    es.json, en.json (pt = add pt.json + routing locale)
```

## Anatomy of a feature

```
features/<name>/
├── index.ts        PUBLIC API — the only thing other code may import
├── types.ts        DTOs mirrored from the core (`PersonDto`, `OrderDto`…) and constants
├── api.ts          React Query hooks: useX (queries), useCreateX/useUpdateX (mutations), query keys
└── components/     Feature UI (forms, cards, badges). Import own files relatively.
```

- Hooks own the endpoints and cache keys; pages never call `useApi()` directly.
- Mutations invalidate their own keys. Cross-feature invalidation (e.g. a payment advancing an
  order) uses the *root* key of the other feature (`["orders"]`), never its internal shape.
- Pages pass `onSuccess` / `onError` per call (`mutate(vars, { onSuccess, onError })`) so UI
  concerns (toasts, navigation) stay in `app/`; `useApiErrorToast()` is the standard `onError`.

## Dependency rules (enforced by ESLint)

| From          | May import                                            | Must not import                   |
|---------------|-------------------------------------------------------|-----------------------------------|
| `app/`        | `@/features/<name>` (index only), `@/shared/*`        | `@/features/<name>/<deep path>`   |
| `features/x/` | own files (relative), `@/shared/*`                    | any other `@/features/*`, `@/app` |
| `shared/`     | `@/shared/*`                                          | `@/features/*`, `@/app/*`         |

When a component needs data from two features (e.g. the order form needs patient and clinic
choices), the **page composes** it: it calls `usePatients()` / `useClinics()` and passes plain
options down (`OrderFormOption[]`). Features stay independent; `app/` is the only place that
knows about several features at once.

Shared UI that several features need but that is not business-specific (media upload/gallery)
lives in `shared/` (`shared/media`), not in a feature.

## Runtime pieces

- **Auth**: `shared/auth/provider.tsx` wraps `react-oidc-context` (Keycloak, PKCE, silent renew
  through `public/silent-renew.html`). `getAccessToken()` reads the current token from
  `sessionStorage` so requests never use a stale token after a renew.
- **API**: `shared/api/client.ts` → `api(path, token, init)`; problem+json errors become
  `ApiError {status, code, errors}`; `useApi()` (shared/query) binds the token.
- **i18n**: `[locale]` segment (`es` default, `en`); `next.config.ts` points next-intl to
  `src/shared/i18n/request.ts`. Messages are grouped by feature key (`orders.*`, `lab.*`…).
- **Layout guard**: `(app)/layout.tsx` requires a session, calls `useMe()`, redirects to
  `/onboarding` when the user has no domain person yet, and renders `AppShell` with a minimal
  `ShellUser` (roles, display name, email, hasProfile).

## Checks

```bash
npx tsc --noEmit   # types
npm run lint       # includes the boundary rules above
npx next build
```
