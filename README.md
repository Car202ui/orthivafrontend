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
messages/{es,en}.json          # Textos por idioma (agregar pt.json para portugués)
public/silent-renew.html       # Callback del iframe de renovación silenciosa de token
src/
├── proxy.ts                   # Detección de idioma y redirección (/ -> /es)
├── i18n/                      # routing, navigation (Link/useRouter con locale), request
├── app/[locale]/
│   ├── layout.tsx             # Proveedores: next-intl, OIDC, React Query, toasts
│   ├── page.tsx               # Login
│   └── (app)/                 # Zona autenticada (guard + onboarding + shell con menú por rol)
│       ├── dashboard/         # Panel según rol
│       ├── onboarding/        # Usuario nuevo elige DOCTOR/PATIENT y completa perfil
│       ├── profile/           # Mi perfil
│       ├── doctor/clinics/    # Clínicas del doctor (CRUD)
│       ├── doctor/patients/   # Pacientes: lista con búsqueda, alta, ficha [id] (con sus órdenes)
│       ├── doctor/orders/     # Órdenes: lista con filtro, new (borrador), [id] (pestañas prescripción/archivos/enviar o detalle + pagos + línea de tiempo)
│       ├── lab/orders/        # Laboratorio: bandeja (pendientes de planeación) y [id] con prescripción + editor/envío del plan
│       ├── patient/treatment/ # Portal del paciente (equipo tratante)
│       └── admin/users/       # ADMIN crea usuarios internos
├── components/
│   ├── layout/                # app-shell (header, nav, menú de usuario), language-switcher
│   ├── forms/profile-form.tsx # Formulario de perfil (react-hook-form + zod)
│   └── ui/                    # shadcn/ui (Base UI) + form.tsx propio
└── lib/
    ├── auth.tsx               # Config OIDC + useAuth + getAccessToken (token fresco)
    ├── api.ts                 # Cliente HTTP al core (bearer, problem+json) + tipos
    └── query.tsx              # React Query provider, useApi, useMe
```

## Estado

- **Fase 0** ✅ login, sesión y llamada autenticada al core.
- **Fase 1.1** ✅ i18n es/en, onboarding, perfil, menú por rol, administración de usuarios internos.
- **Fase 1.2** ✅ clínicas, pacientes (búsqueda, alta, ficha, edición) y portal del paciente.
- **Fase 1.3** ✅ prescripciones: formulario con movimientos por diente, carga de archivos con miniaturas, envío al laboratorio, línea de tiempo y pagos.
- **Fase 1.4** ✅ laboratorio: bandeja, plan de tratamiento (etapas, precios, imágenes 3D/PDF/STL) y envío al doctor; pago simulado en desarrollo.
- Siguientes: 1.5 aprobación · 1.4 planeación · 1.5 aprobación · 1.6 pagos · 1.7 seguimiento · 1.8 notificaciones.
