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

## Arquitectura

Estructura **por features** con fronteras verificadas por ESLint. Detalle y reglas en [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md).

```
messages/{es,en}.json          # Textos por idioma (agregar pt.json para portugués)
public/silent-renew.html       # Callback del iframe de renovación silenciosa de token
src/
├── proxy.ts                   # Detección de idioma y redirección (/ -> /es)
├── app/[locale]/              # Solo rutas y layouts (delgados: componen hooks y componentes de features)
│   ├── layout.tsx             # Proveedores: next-intl, OIDC, React Query, toasts
│   ├── page.tsx               # Login
│   └── (app)/                 # Zona autenticada (guard + onboarding + shell con menú por rol)
│       ├── dashboard/  onboarding/  profile/  admin/users/
│       ├── doctor/{clinics,patients,orders}/
│       ├── lab/orders/
│       └── patient/treatment/
├── features/                  # Una carpeta por capacidad de negocio (espejo de los módulos del core)
│   └── <feature>/             # index.ts (API pública) · types.ts · api.ts (hooks React Query) · components/
│       identity · patients · clinics · orders · planning · payments
└── shared/                    # Transversal, sin negocio
    ├── api/                   # client.ts (fetch + ApiError), errors.ts (useApiErrorToast)
    ├── auth/                  # OIDC provider + getAccessToken (token fresco)
    ├── query/                 # React Query provider + useApi
    ├── i18n/                  # routing, navigation (Link/useRouter con locale), request
    ├── layout/                # app-shell (header, nav, menú de usuario), language-switcher
    ├── media/                 # MediaPanel (carga/galería de archivos) + tipos
    ├── ui/                    # shadcn/ui (Base UI) + form.tsx propio
    └── lib/                   # utils (cn), dates
```

Reglas: `app/` importa `@/features/<x>` (solo su `index.ts`) y `@/shared/*`; una feature no importa otra feature; `shared/` no importa features. `npm run lint` falla si se rompen.

## Estado

- **Fase 0** ✅ login, sesión y llamada autenticada al core.
- **Fase 1.1** ✅ i18n es/en, onboarding, perfil, menú por rol, administración de usuarios internos.
- **Fase 1.2** ✅ clínicas, pacientes (búsqueda, alta, ficha, edición) y portal del paciente.
- **Fase 1.3** ✅ prescripciones: formulario con movimientos por diente, carga de archivos con miniaturas, envío al laboratorio, línea de tiempo y pagos.
- **Fase 1.4** ✅ laboratorio: bandeja, plan de tratamiento (etapas, precios, imágenes 3D/PDF/STL) y envío al doctor; pago simulado en desarrollo.
- **Fase 1.5** ✅ revisión del plan por el doctor: comentarios (pedir cambios), aprobación con dirección de envío y acuerdo de responsabilidad, rechazo; hilo visible para el laboratorio; el paciente ve su plan aprobado.
- **Fase 1.6** ✅ pagos: `/doctor/payments/[id]` (resumen + «Pagar» → checkout de la pasarela por redirección), `/doctor/payments/[id]/return` (espera la confirmación del webhook), `/pay/mock/[reference]` (simulador de pasarela para desarrollo).
- **Fase 1.7** ✅ `/lab/production` (cola: por fabricar → en producción → enviadas, registro de guía), controles del doctor en `/doctor/orders/[id]` (fecha, mes, notas, fotos; cerrar tratamiento), envío y evolución visibles para el paciente.
- Siguientes: 1.8 notificaciones · 1.9 calidad.
