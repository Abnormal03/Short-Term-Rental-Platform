# Betoch backend

Express 5 API, Clerk authentication, PostgreSQL, Prisma, Cloudinary uploads from the frontend, and Chapa payments.

## Local setup

1. Install Node.js 20+ and npm.
2. Create a PostgreSQL database and copy `.env.example` to `.env`.
3. Fill in the required credentials and URLs. Keep `.env` private.
4. Run `npm install`. The postinstall hook generates the Prisma client.
5. Run `npx prisma migrate deploy` to apply committed migrations.
6. Run `npm run dev` to start the API with Nodemon on port 3000 by default. Use `npm start` for production; it runs Node directly.

The frontend Vite server proxies `/api` to `http://localhost:3000` by default. Set frontend `VITE_DEV_API_PROXY_TARGET` if the API is elsewhere.

## Environment variables

Required for normal API operation: `DATABASE_URL`, `CLERK_SECRET_KEY`, and `CLERK_WEBHOOK_SECRET`. Set `CORS_ORIGINS` to a comma-separated list of exact frontend origins (scheme and host, no path). Set `FRONTEND_URL` to the frontend origin for payment redirects. `PORT` and `NODE_ENV` are optional locally; set `NODE_ENV=production` in the production service.

| Variable | Required when | Purpose |
| --- | --- | --- |
| `DATABASE_URL` | Always | PostgreSQL connection string |
| `CLERK_SECRET_KEY` | Always | Verifies Clerk sessions through Clerk middleware |
| `CLERK_WEBHOOK_SECRET` | Clerk user sync | Svix signing secret for `/webhooks/clerk` |
| `CHAPA_SECRET_KEY` | Payments/refunds | Chapa API bearer credential; backend only |
| `CHAPA_WEBHOOK_SECRET` | Chapa POST webhooks | Random secret hash configured in Chapa dashboard |
| `CHAPA_CALLBACK_URL` | Payments | Public API callback URL, normally `/webhooks/chapa` |
| `CHAPA_RETURN_URL` | Payments | Frontend return URL supplied during initialization |
| `FRONTEND_URL` | Payment redirects | Frontend origin, no trailing slash required |
| `CORS_ORIGINS` | Production | Comma-separated allowlist of frontend origins |
| `PORT` | Hosting platform assigns one | HTTP listener port; defaults to `3000` |
| `NODE_ENV` | Production | Set to `production` to enable production DB TLS behavior |

Payment initialization and refunds require `CHAPA_SECRET_KEY`; configure `CHAPA_CALLBACK_URL` to this API's `/webhooks/chapa` endpoint and `CHAPA_RETURN_URL` to a frontend route. Configure the same random webhook secret in Chapa's dashboard and `CHAPA_WEBHOOK_SECRET`. Never use the API key as the webhook secret. Use production TLS database settings in production.

Register the Clerk webhook endpoint as `https://<api-host>/webhooks/clerk`. Configure the Chapa callback/webhook endpoints to the API's `/webhooks/chapa` endpoint. Verify these settings in the provider dashboards before accepting live payments.

## Database creation and Prisma

Create a PostgreSQL database and put its connection URL in `DATABASE_URL`. For a local PostgreSQL service, a typical URL is `postgresql://USER:PASSWORD@localhost:5432/betoch?schema=public`. In production use the provider's TLS connection URL and allow network access from the API service.

- Schema: `prisma/schema.prisma`
- Committed migrations: `prisma/migrations`
- Apply migrations: `npx prisma migrate deploy`
- Generate client: `npx prisma generate`

There is currently no Prisma seed script or committed seed data. Create the first admin account through the application's supported Clerk/user provisioning process; do not assume a default admin is created by migrations.

Do not run `prisma migrate reset` against a database containing data. Create a reviewed migration with `npx prisma migrate dev --name <change>` in development and commit the generated migration.

## Production deployment checklist

- Configure all secrets in the hosting provider; do not commit `.env` files.
- Provision PostgreSQL and apply migrations before directing traffic to the API.
- Set exact `CORS_ORIGINS`, `FRONTEND_URL`, and provider callback URLs.
- Set Clerk webhook URLs/secrets and test user create/update/delete synchronization.
- Run Clerk and Chapa end-to-end checks in their dashboards/test environment. These cannot be completed from repository configuration alone.
- Chapa refund handling currently needs provider-level validation: the application records a successful refund response as completed, while Chapa documents refund processing states (`initiated`, `processing`, `refunded`, `reversed`). Do not enable live refunds until the application records and reconciles final refund status.
- Error handling needs a production pass: the Express error middleware logs the full error object and returns `err.message`; multiple controller catch blocks also return exception messages, which can expose database/provider details. Replace internal-error responses with a generic message, retain details only in protected server logs, and standardize structured request/error logging before launch.
- Monitor service logs, database connectivity, and provider callbacks after release.
