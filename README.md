# Betoch Rentals

Short-term rental platform for Ethiopia. The repository contains a React/Vite frontend and an Express/Prisma API.

## Run locally

1. Create `backend/.env` from `backend/.env.example` and set PostgreSQL and Clerk values. See the backend guide for database and provider setup. No seed script is currently provided.
2. Create `frontend/.env.local` from `frontend/.env.example` and set the Clerk publishable key. Add Cloudinary credentials to enable host image uploads.
3. Install dependencies with `npm run install:all` from the project root.
4. Apply database migrations with `cd backend && npx prisma migrate deploy`.
5. Start the API and UI in separate terminals with `npm run dev:backend` and `npm run dev:frontend` from the root.

The frontend proxies `/api` to the local backend. Set `VITE_DEV_API_PROXY_TARGET` when the API runs at a different address. For production, configure `VITE_API_BASE_URL` and provider secrets in the hosting platforms. See [frontend setup](frontend/README.md) and [backend setup](backend/README.md) for details.

## Release readiness

- Frontend production build: `cd frontend && npm run build`
- Frontend lint: `cd frontend && npm run lint`
- Deploy the API and frontend, apply migrations, then verify Clerk webhooks and Chapa payment callbacks using provider test environments.
- Have the Terms of Service and Privacy Policy reviewed and finalized before public launch.

## Production hosting outline

- Deploy `backend` as a Node service with `npm install` at build time and `npm start` at runtime. Set the backend environment variables from `backend/.env.example` in the host's secret/configuration panel. Give it a persistent HTTPS URL.
- Provision managed PostgreSQL, set its TLS `DATABASE_URL` on the backend, then run `cd backend && npx prisma migrate deploy` as a release step before sending traffic.
- Deploy `frontend` as a static Vite site with `npm install` and `npm run build`; publish `frontend/dist`. Set its `VITE_*` values before building, point `VITE_API_BASE_URL` to `<backend-origin>/api/v1`, and configure SPA fallback/rewrite to `index.html`.
- Set backend `CORS_ORIGINS` to the exact HTTPS frontend origin and `FRONTEND_URL` to that same origin. Register Clerk's frontend origin and the backend `/webhooks/clerk` webhook URL. Register Chapa's backend `/webhooks/chapa` callback/webhook URL and frontend return URL.
- Provider dashboard access and deployed credentials are not available in this repository, so Clerk and Chapa live/test transactions still require verification in the target environment. Keep live payments/refunds disabled until success, failure, retries, callbacks, and final refund status have been confirmed.

