# TradeNexa Admin

Admin panel for the **TradeNexa** B2B marketplace. Role-based dashboards for Super Admin, Admin, and Support to manage products, categories, brands, banners, offers, and platform ops.

**Live:** [https://tradehub-admin.vercel.app](https://tradehub-admin.vercel.app)

## Stack

- **Next.js** 16 (App Router) + **React** 19
- **TypeScript**
- **Tailwind CSS** v4
- **React Hook Form** + **Zod**
- **Recharts** (dashboard charts)
- **Sonner** (toasts)
- Backend API: Railway (`/api/v1`)

## Roles

| Role | Base path | Notes |
|------|-----------|--------|
| Super Admin | `/super-admin` | Full ops + banners |
| Admin | `/admin` | Core marketplace management |
| Support | `/support` | Support-focused modules |

## Implemented modules

- Dashboard (platform KPIs + charts via `GET /dashboard/admin`)
- Product Approval (queue, detail modal, approve / revision / reject)
- Categories & subcategories
- Brands
- Offers
- Banners (Super Admin)

Other nav items may show as placeholders until built.

## Getting started

### Prerequisites

- Node.js 20+
- npm
- Access to the TradeNexa backend

### Setup

```bash
git clone git@github.com:paneliyatechnology-debug/TradeNexa_admin.git
cd TradeNexa_admin
npm install
cp .env.example .env.local
```

Edit `.env.local`:

```env
NEXT_PUBLIC_BACKEND_URL=https://tradenexabackend-production.up.railway.app
NEXT_PUBLIC_ENABLE_ROLE_SWITCHER=true
```

| Variable | Purpose |
|----------|---------|
| `NEXT_PUBLIC_BACKEND_URL` | Backend root (API + media) |
| `NEXT_PUBLIC_ENABLE_ROLE_SWITCHER` | Role preview switcher (testing); relaxes some route checks when `true` |

### Run locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) and sign in at `/login`.

### Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Development server |
| `npm run build` | Production build |
| `npm run start` | Serve production build |
| `npm run lint` | ESLint |

## Project structure

```text
src/
  app/                 # Routes (login, role dashboards, modules)
  components/          # UI + feature screens
  config/              # API endpoints, navigation, routes
  services/            # Backend API clients
  types/               # Shared TypeScript types
  hooks/               # Auth, sidebar, etc.
  utils/               # API client, media URL helpers
  styles/              # Global tokens (Trade Ledger theme)
```

## Git remotes

Prefer **SSH** (recommended if your GitHub SSH key is set up):

```bash
git remote set-url origin git@github.com:parthil1/TradeNexa_admin.git
git remote set-url upstream git@github.com:paneliyatechnology-debug/TradeNexa_admin.git
```

Push:

```bash
# Local branch is master
git push origin master
git push upstream master
```

> There is no local `main` branch. Use `master`, or `git push upstream master:main` if the remote expects `main`.

## Deploy (Vercel)

Project is configured for Vercel. Ensure these env vars are set in the Vercel project:

- `NEXT_PUBLIC_BACKEND_URL`
- `NEXT_PUBLIC_ENABLE_ROLE_SWITCHER` (optional)

```bash
npx vercel --prod
```

Or connect the GitHub repo in the [Vercel dashboard](https://vercel.com) for automatic deploys.

## License

Private — TradeNexa / Paneliya Technology.
