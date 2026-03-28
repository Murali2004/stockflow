# StockFlow

A minimal multi-tenant SaaS inventory management system built as a 6-hour MVP. Each organisation gets their own isolated workspace to manage products, track stock levels, and monitor low-stock alerts.

---

## Features

- **Authentication** — Signup, login, and logout with JWT-based sessions and bcrypt password hashing
- **Multi-tenancy** — Every user belongs to an organisation; all data is strictly scoped by org (no cross-tenant leaks)
- **Products** — Full CRUD with name, SKU, description, quantity, cost price, selling price, and per-product low stock threshold
- **Stock adjustment** — Quick +/- adjustment modal with live quantity preview, separate from the full edit form
- **Dashboard** — At-a-glance stats (total products, units in stock, inventory value, low stock count) plus a low stock alert table
- **Settings** — Organisation-level default low stock threshold applied to any product that doesn't have its own override
- **Toast notifications** — Feedback on every action (create, edit, delete, adjust, save, login, signup)

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript |
| Database | PostgreSQL (Supabase) |
| ORM | Prisma 5 |
| Auth | JWT (`jose`) + bcrypt |
| UI | Tailwind CSS + shadcn/ui |
| Notifications | Sonner |
| Deployment | Vercel |

---

## Getting Started

### Prerequisites

- Node.js 18+
- A PostgreSQL database (Supabase free tier works)

### Installation

```bash
git clone https://github.com/your-username/stockflow.git
cd stockflow
npm install
```

### Environment Variables

Create a `.env` file in the project root:

```env
DATABASE_URL=postgresql://user:password@host:5432/dbname
JWT_SECRET=your-strong-random-secret-min-32-chars
```

### Database Setup

```bash
npx prisma db push
npx prisma generate
```

### Run Locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) — you'll be redirected to `/login`.

---

## Project Structure

```
stockflow/
├── app/
│   ├── (auth)/              # Login and signup pages
│   ├── (dashboard)/         # Protected dashboard pages
│   │   ├── dashboard/       # Stats overview
│   │   ├── products/        # Product list + modals
│   │   └── settings/        # Org settings
│   └── api/                 # Route handlers (REST API)
│       ├── auth/            # login, signup, logout
│       ├── products/        # CRUD + stock adjustment
│       ├── dashboard/       # Stats aggregation
│       └── settings/        # Org settings
├── components/ui/           # shadcn/ui components
├── lib/                     # Auth, DB client, validation, constants
├── prisma/
│   └── schema.prisma        # Database schema
└── middleware.ts             # JWT verification + org/user header injection
```

---

## API Overview

All API routes require a valid session cookie. The middleware verifies the JWT and injects `x-user-id` and `x-org-id` headers — route handlers use these to scope every query.

| Method | Route | Description |
|---|---|---|
| `POST` | `/api/auth/signup` | Create account + org |
| `POST` | `/api/auth/login` | Login, set session cookie |
| `POST` | `/api/auth/logout` | Clear session cookie |
| `GET` | `/api/products` | List products (supports `?search=`) |
| `POST` | `/api/products` | Create product |
| `GET` | `/api/products/:id` | Get single product |
| `PUT` | `/api/products/:id` | Update product |
| `PATCH` | `/api/products/:id` | Adjust stock quantity (+/- delta) |
| `DELETE` | `/api/products/:id` | Delete product |
| `GET` | `/api/dashboard` | Dashboard stats + low stock list |
| `GET` | `/api/settings` | Get org settings |
| `PUT` | `/api/settings` | Update org settings |

---

## Deployment

### Vercel

1. Push the repo to GitHub
2. Import the project on [vercel.com](https://vercel.com)
3. Add environment variables in the Vercel dashboard:
   - `DATABASE_URL`
   - `JWT_SECRET` (use a strong random string in production)
4. Deploy — Vercel auto-detects Next.js, no extra config needed

---

## Out of Scope (MVP)

The following are intentionally excluded from this phase:

- Multi-user organisations and role-based access control
- Stock movement history and audit logs
- Product variants, categories, and images
- Purchase orders and supplier management
- CSV import / export
- Email notifications
- Billing and subscription management
- Mobile-optimised UI
