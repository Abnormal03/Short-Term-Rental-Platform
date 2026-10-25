# Betoch frontend

React 19, Vite, Tailwind CSS, Clerk authentication, and TanStack Query frontend for Betoch Rentals.

## Local setup

1. Install Node.js 20.19+ or 22.12+ and npm.
2. Run `npm install` in this directory.
3. Copy `.env.example` to `.env.local` and set the Clerk publishable key. The local API proxy targets `http://localhost:3000`; set `VITE_DEV_API_PROXY_TARGET` to change it. `VITE_API_BASE_URL` defaults to `/api/v1` and is usually left at that value locally.
4. Start the backend in a separate terminal, then run `npm run dev` here. The development site is served by Vite, normally at `http://localhost:5173`.

For a deployed frontend, set `VITE_CLERK_PUBLISHABLE_KEY`, `VITE_API_BASE_URL` (backend origin plus `/api/v1`), `VITE_CLOUDINARY_CLOUD_NAME`, and `VITE_CLOUDINARY_UPLOAD_PRESET` in the hosting provider. Vite embeds these values during build, so configure them before building. These values are public client configuration; never put Clerk secret keys or Chapa credentials in the frontend environment.

## Scripts

- `npm run dev` starts the Vite development server.
- `npm run build` creates the production bundle in `dist`.
- `npm run preview` serves a local preview of the production bundle.
- `npm run lint` runs ESLint.

Configure Clerk's allowed origins and redirect URLs for the deployed frontend. Configure the frontend host to serve `index.html` for client-side routes such as `/properties/:id` and `/admin`.

## Main flows

- Guests browse `/explore` and `/properties`, inspect property details, then authenticate to check out and pay.
- Hosts manage listings from `/overview` and `/properties`.
- Administrators review listings, host verification, and disputes under `/admin`.
