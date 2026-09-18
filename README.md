# Orthiva — Web

Frontend de la plataforma Orthiva. Next.js 16 (App Router) + TypeScript + Tailwind CSS 4 + shadcn/ui. Autenticación OIDC (PKCE) contra Keycloak con `react-oidc-context`.

## Requisitos

- Node 20+
- Backend corriendo (ver repositorio `Orthivabacked`): Keycloak en `:8180` y core en `:8080`

## Arranque

```bash
copy .env.local.example .env.local
npm install
npm run dev
```

Abrir `http://localhost:3000`. "Ingresar" redirige a Keycloak; tras el login vuelve a `/dashboard`, que muestra el token y la respuesta de `GET /api/me` del core.

## Estructura

```
src/
├── app/
│   ├── layout.tsx          # AuthProvider global
│   ├── page.tsx            # Login
│   └── dashboard/page.tsx  # Placeholder post-login
├── components/ui/          # shadcn/ui
└── lib/
    ├── auth.tsx            # Config OIDC + useAuth + rolesFromToken
    └── api.ts              # Cliente HTTP al core (bearer, problem+json)
```

## Estado

**Fase 0**: login, sesión y llamada autenticada al core. Los menús por rol (doctor, laboratorio, paciente, admin…) llegan en la Fase 1.
