# Notebook App

A full-stack note-taking application built with Next.js 16, React 19, and PostgreSQL. Supports rich text editing, image uploads, tagging, search, and pagination.

## Tech Stack

- **Framework:** Next.js 16 (App Router)
- **Language:** TypeScript
- **Database:** PostgreSQL (Supabase) with Drizzle ORM
- **Authentication:** Better Auth with GitHub OAuth
- **Storage:** Cloudflare R2 (image uploads)
- **Styling:** Tailwind CSS 4
- **UI Components:** RizzUI, Headless UI
- **Rich Text Editor:** TipTap
- **Validation:** Zod

## Features

- GitHub OAuth authentication
- Create, edit, and delete notes
- Rich text editing with TipTap
- Image uploads to Cloudflare R2
- Tag notes and filter by tags
- Full-text search across titles and content
- Server-side pagination
- Input validation and HTML sanitization

## Project Structure

```
src/
├── app/                          # Next.js App Router pages
│   ├── layout.tsx                # Root layout
│   ├── page.tsx                  # Home page (note listing)
│   ├── new/page.tsx              # Create note page
│   ├── notes/[id]/edit/page.tsx  # Edit note page
│   └── api/auth/[...all]/        # Auth API route handler
├── components/                   # React components
│   ├── ui/                       # Base UI primitives
│   ├── auth/                     # Auth components
│   ├── editor/                   # TipTap editor
│   ├── CreateNoteForm.tsx        # Create note form (client)
│   ├── EditNoteForm.tsx          # Edit note form (client)
│   ├── SearchInput.tsx           # Debounced search
│   ├── Pagination.tsx            # Page navigation
│   ├── TagFilter.tsx             # Tag filter buttons
│   ├── TagList.tsx               # Tag display/management
│   ├── ActiveFilters.tsx         # Active filter chips
│   ├── ImageGallery.tsx          # Image grid display
│   └── DeleteNoteButton.tsx      # Delete with confirmation
├── server/
│   ├── actions/                  # Server actions (mutations)
│   │   ├── notes.action.ts
│   │   ├── users.action.ts
│   │   ├── tags.action.ts
│   │   └── upload.action.ts
│   └── services/                 # Business logic layer
│       ├── notes.service.ts
│       ├── users.service.ts
│       ├── tags.service.ts
│       └── upload.service.ts
├── db/
│   ├── schema.ts                 # Drizzle table definitions
│   └── index.ts                  # Database client
├── lib/
│   ├── validations.ts            # Zod schemas
│   ├── sanitize.ts               # HTML sanitization
│   └── r2.ts                     # Cloudflare R2 client
└── utils/
    ├── auth.ts                   # Server-side auth config
    ├── auth-client.ts            # Client-side auth SDK
    └── getSession.ts             # Session helper
```

## Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL database (e.g. Supabase)
- GitHub OAuth app
- Cloudflare R2 bucket

### 1. Install dependencies

```bash
npm install
```

### 2. Set up environment variables

Copy `.env.example` to `.env` and fill in the values:

```bash
cp .env.example .env
```

| Variable | Description |
|---|---|
| `DATABASE_URL` | PostgreSQL connection string |
| `NEXT_PUBLIC_APP_URL` | App URL (e.g. `http://localhost:3000`) |
| `GITHUB_CLIENT_ID` | GitHub OAuth client ID |
| `GITHUB_CLIENT_SECRET` | GitHub OAuth client secret |
| `BETTER_AUTH_SECRET` | Auth secret (`openssl rand -base64 32`) |
| `CLOUDFLARE_ENDPOINT_URL` | R2 endpoint URL |
| `CLOUDFLARE_ACCESS_KEY_ID` | R2 access key |
| `CLOUDFLARE_SECRET_ACCESS_KEY` | R2 secret key |
| `CLOUDFLARE_BUCKET_NAME` | R2 bucket name |
| `NEXT_PUBLIC_UPLOAD_URL` | Public R2 URL for serving images |

### 3. Push database schema

```bash
npm run db:push
```

### 4. Run the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Scripts

| Script | Description |
|---|---|
| `npm run dev` | Start development server |
| `npm run build` | Production build |
| `npm run start` | Start production server |
| `npm run db:generate` | Generate Drizzle migrations |
| `npm run db:push` | Push schema to database |
| `npm run db:studio` | Open Drizzle Studio |
