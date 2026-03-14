# Endpoints used by the Internal app

## Frontend → Next.js (same origin)

| Client calls        | Used by              |
|---------------------|----------------------|
| `POST /api/auth/login` | Login form (`lib/auth.ts`) |
| `GET /api/facilities`  | Facilities list (`lib/facilitiesApi.ts`) |
| `POST /api/facilities` | Add facility form (`lib/facilitiesApi.ts`) |
| `GET /api/audit-logs`  | Audit log page (`lib/audit.ts`) |

## Next.js API routes → Backend (api.helixhealth.app)

Base URL: `NEXT_PUBLIC_API_URL` or `NEXT_PUBLIC_API_BASE_URL` or `https://api.helixhealth.app`

| Route                | Proxies to (path from env or default)        |
|----------------------|----------------------------------------------|
| `/api/auth/login`    | `POST {base}/auth/internal/login` |
| `/api/facilities` GET  | `GET {base}/api/v1/facilities` (or `NEXT_PUBLIC_FACILITIES_PATH`) |
| `/api/facilities` POST | `POST {base}/api/v1/facilities` (same path)  |
| `/api/audit-logs`    | `GET {base}/api/v1/internal/audit-logs` (or `NEXT_PUBLIC_AUDIT_LOGS_PATH`) |

## Default paths (`lib/constants.ts`)

- `DEFAULT_AUTH_LOGIN_PATH` = `/auth/internal/login` (login endpoint)
- `DEFAULT_FACILITIES_PATH` = `/api/v1/facilities`
- `DEFAULT_AUDIT_LOGS_PATH` = `/api/v1/internal/audit-logs`

## Local dev

- Set `ALLOW_DEV_LOGIN=true` in `.env.local` to allow login when the backend is down or returns 404 (any email/password works). Restart the dev server after changing env.
