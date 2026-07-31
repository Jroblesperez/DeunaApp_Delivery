# FlowOS Deuna Web · Experience 2.0

**Enterprise Execution Intelligence** — “De la estrategia a la ejecución, con claridad para decidir.”

MVP interno, navegable y responsive que transforma evidencia operativa en explicaciones, decisiones y acciones ejecutivas. **No mostramos más datos: ayudamos a que los líderes tomen mejores decisiones.** Jira permanece como sistema de registro; FlowOS es la capa de inteligencia. Todos los datos visibles están marcados **DEMO DATA**.

## Arquitectura y stack

Monolito modular con Next.js App Router, React, TypeScript strict, CSS accesible, API Routes REST, Prisma y SQLite en desarrollo (el modelo es portable a PostgreSQL ajustando el provider). La UI lee un repositorio demo determinístico para arrancar sin infraestructura; Prisma define y puede persistir el mismo dominio. No hay secretos, contraseñas ni integraciones externas.

## Ejecutar

```bash
cp .env.example .env
npm install
npm run dev
# http://localhost:3000
```

Validación: `npm run build`, `npm run lint`, `npm run test`, `npm run typecheck`. Para persistencia demo: `npx prisma generate && npx prisma db push && npm run db:seed`.

## Rutas

- `/` Executive Overview (inicial)
- `/decisions` Decision Center con decisiones priorizadas y estado local simulado
- `/pulse` Organizational Pulse narrativo
- `/intelligence/memory` Executive Memory con comparaciones semanales, mensuales y trimestrales
- `/initiatives` y `/initiatives/FLOW-001` Initiative Control Tower y detalle
- `/portfolio`, `/ecos`, `/delivery`, `/analytics`
- `/dependencies`, `/risks`, `/releases`, `/capacity`
- `/intelligence`, `/advisor` (Rovo-ready simulation), `/admin`
- API: `/api/executive/summary`, `/api/portfolio`, `/api/initiatives`, `/api/initiatives/:id`, `/api/initiatives/:id/timeline`, `/api/capacity`, `/api/risks`, `/api/dependencies`, `/api/releases`, `/api/actions`, `/api/metrics`, `/api/decisions`, `/api/pulse`, `/api/insights`, `/api/intelligence/memory`, `/api/intelligence/movements`

## Demo data y roles

Incluye 1 organización, 9 ECO/CoE, 15 equipos, 36 iniciativas, dependencias, matrices, planes, releases, capacidad y métricas coherentes. Experience 2.0 agrega snapshots demo de cuatro semanas, tres meses y dos trimestres para Executive Memory, Strategic Movement y reglas de decisiones. Perfiles: Valentina (`EXECUTIVE`), Santiago (`ECO_LEADER`), Daniela (`DELIVERY_LEADER`), Mateo (`PRODUCT_LEADER`), Camila (`RISK_LEADER`), Nicolás (`TEAM_USER`) e Isabel (`ADMIN`). El selector de rol se limita conceptualmente a `AUTH_MODE=demo`; producción debe rechazarlo.

## Variables e integraciones

Copie `.env.example`; nunca confirme valores reales. `AUTH_MODE=demo` usa sesión controlada sin password. Para Entra ID, cambie a `entra`, configure tenant/client secret desde un secret manager y valide claims/grupos en backend. Las interfaces Jira en `lib/jira` soportan lectura, mapping, normalización y paginación; implemente OAuth 2.0 sin habilitar escritura. FlowOS expone envelopes con estado, fuente, cobertura y warnings para que Rovo interprete resultados calculados, sin agente generativo en el MVP.

Más detalle: [`docs/architecture.md`](docs/architecture.md), [`docs/data-model.md`](docs/data-model.md), [`docs/jira-integration.md`](docs/jira-integration.md), [`docs/security.md`](docs/security.md), [`docs/rovo-readiness.md`](docs/rovo-readiness.md).

## Enterprise Platform 3.0

FlowOS opera por defecto con **Deuna Ecuador** y expone contexto persistente de trimestre, salud, cobertura, sincronización, conexiones y modo `DEMO DATA`. `/login` ofrece sesión demo controlada y prepara providers Entra ID/Atlassian; en producción `middleware.ts` protege rutas si `DEMO_MODE=false`. `/setup` guía la configuración inicial en diez pasos.

El backoffice `/admin` centraliza Integration Hub, Centro de sincronización, proyectos Jira, Status Mapping, Custom Fields y calidad de datos. `Snapshot Engine` desacopla las pantallas de Jira mediante FULL/INCREMENTAL/MANUAL/SCHEDULED, checkpoints, deduplicación, cobertura parcial y fallback al último snapshot válido. Ninguna conexión demo realiza llamadas externas.

Rutas Enterprise: `/login`, `/setup`, `/admin/integrations`, `/admin/sync`, `/admin/jira/projects`, `/admin/jira/status-mapping`, `/admin/jira/fields`, `/admin/data-quality`. APIs: `/api/organization/context`, `/api/integrations`, `/api/integrations/:id`, `/api/sync/status`, `/api/sync/runs`, `POST /api/sync/run`, `/api/admin/projects`, `/api/admin/status-mapping`, `/api/admin/field-mapping`, `/api/admin/data-quality`, `/api/strategy/map`, `/api/strategy/capacity`, `/api/strategy/flow`, `/api/auth/session`, `POST /api/auth/demo-login`, `POST /api/auth/logout`.

Para un futuro modo LIVE: configure las variables Atlassian de `.env.example`, use referencias a secretos de vault, valide scopes read-only y mantenga tokens únicamente en backend. El MVP no registra aplicaciones, no conecta servicios reales y no escribe en Jira.
