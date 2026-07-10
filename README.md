# Airbnb Clone

A functional clone of Airbnb — browse and search listings, view listing details, book stays for a date range, and manage listings as a host. Built for the SDE Fullstack Assignment.

- **Live demo:** _add your deployed URL here_
- **Repo:** _add your GitHub URL here_

## Tech stack

| Layer     | Choice |
|-----------|--------|
| Frontend  | Next.js 16 (App Router, TypeScript), Tailwind CSS v4 |
| Backend   | FastAPI (Python 3.12), SQLAlchemy 2.0 |
| Database  | SQLite |
| Auth      | Email/password with hashed passwords (passlib/bcrypt) + JWT bearer tokens |
| Extras    | react-day-picker (date ranges), react-leaflet + OpenStreetMap (map, no API key required), react-hot-toast (notifications), next-themes (dark mode), lucide-react (icons) |

## Project structure

```
Airbnb/
  backend/            FastAPI app
    app/
      main.py          App entrypoint, CORS, static file mount, router registration
      config.py        Environment-driven settings (pydantic-settings)
      database.py      SQLAlchemy engine/session
      models.py        ORM models (see schema below)
      schemas.py       Pydantic request/response models
      auth.py          Password hashing + JWT encode/decode
      deps.py          FastAPI dependencies (current user, optional user, require host)
      utils.py         Rating aggregation, price breakdown, superhost calculation
      seed.py          Seed script — demo hosts/guests, listings, bookings, reviews
      routers/         auth, listings, bookings, reviews, favorites, host, amenities
    static/uploads/    Uploaded listing photos (served at /static/uploads/...)
    requirements.txt
    render.yaml        Render deployment config
  frontend/            Next.js app (App Router)
    app/               Routes: / , /listings/[id], /trips, /wishlist, /host, /host/listings/new, /host/listings/[id]/edit
    components/        navbar/, listing/, host/, trips/, ui/ — organized by feature
    lib/                api.ts (fetch client), auth-context.tsx, favorites-context.tsx, types.ts
  README.md
```

## Getting started

### Prerequisites
- Python 3.11+
- Node.js 20+

### Backend

```bash
cd backend
python -m venv venv
# Windows
venv\Scripts\activate
# macOS/Linux
source venv/bin/activate

pip install -r requirements.txt
cp .env.example .env         # defaults work out of the box for local dev

python -m app.seed           # seeds the SQLite DB with demo data (safe to re-run; skips if already seeded)
uvicorn app.main:app --reload --port 8000
```

API is now live at `http://localhost:8000`, interactive docs at `http://localhost:8000/docs`.

To reset the database, delete `backend/app.db` and re-run `python -m app.seed`.

### Frontend

```bash
cd frontend
npm install
cp .env.local.example .env.local   # NEXT_PUBLIC_API_URL=http://localhost:8000
npm run dev
```

App is now live at `http://localhost:3000`.

### Demo accounts

All seeded users share the password `password123`.

| Role  | Email |
|-------|-------|
| Host  | host1@example.com … host4@example.com |
| Guest | guest1@example.com, guest2@example.com |

Any account can switch into hosting via the "Become a host" link in the navbar — there's no approval step, matching the assignment's "mocked" auth guidance.

## Architecture overview

- **Auth**: signup/login issue a JWT (7‑day expiry) that the frontend stores in `localStorage` and attaches as a `Bearer` token on every request (`lib/api.ts`). There's a single `users` table — every user can act as guest and/or host via an `is_host` flag, toggled client-side by calling `PATCH /api/auth/become-host`. This mirrors Airbnb's real "switch to hosting" UX without needing separate account types.
- **Search/browse**: `GET /api/listings` supports free-text location, date-range availability filtering (excludes listings with an overlapping confirmed booking), guest count, price range, property type, and amenity filters, with page-based pagination.
- **Booking integrity**: `POST /api/bookings` re-validates guest capacity and re-checks for overlapping confirmed bookings server-side (not just client-side) before inserting, so double-booking isn't possible even under concurrent requests to the same listing/date range. Price fields are snapshotted onto the booking row at creation time so historical bookings remain accurate even if a host later changes their nightly rate.
- **Host CRUD**: listings, photos (URL or direct file upload to `backend/static/uploads`), and amenities are fully editable by their owning host only (`host_id` ownership check on every mutation).
- **Reviews**: a guest can review a listing only once they have a `confirmed` booking whose `check_out` date has passed, and only once per booking (`booking_id` is unique on `reviews`).
- **Superhost**: computed on the fly (not stored) — a host is a Superhost once their listings' aggregate rating is ≥4.8 across ≥3 reviews.
- **Map**: react-leaflet + OpenStreetMap tiles — no Google Maps/Mapbox API key needed. Hosts can click the map in the listing form to drop a pin (or leave it unset).

## Database schema

```
users
  id, email (unique), hashed_password, name, avatar_url, is_host, created_at

listings
  id, host_id -> users, title, description, property_type, room_type,
  city, state, country, latitude, longitude,
  price_per_night, cleaning_fee, max_guests, bedrooms, beds, bathrooms,
  created_at, updated_at

listing_photos
  id, listing_id -> listings, url, sort_order

amenities
  id, name (unique), icon

listing_amenities  (join table)
  listing_id -> listings, amenity_id -> amenities

bookings
  id, listing_id -> listings, guest_id -> users,
  check_in, check_out, guests_count,
  nightly_rate_snapshot, cleaning_fee_snapshot, service_fee_snapshot, total_price,
  status (confirmed | cancelled), created_at

reviews
  id, listing_id -> listings, booking_id -> bookings (unique), author_id -> users,
  rating (1-5), comment, created_at

favorites
  id, user_id -> users, listing_id -> listings (unique on user_id+listing_id), created_at
```

Relationships: one host (`users`) has many `listings`; one listing has many `photos`, many-to-many `amenities`, many `bookings`, many `reviews`. A `booking` has at most one `review`. A `user` has many `favorites` (many-to-many with `listings` via the join table).

Tables are created via `SQLAlchemy`'s `Base.metadata.create_all()` on startup rather than a migration tool — reasonable for a project seeded fresh from a schema that isn't expected to evolve across deployed versions; a real production app would use Alembic.

## API overview

All endpoints are prefixed `/api`. Full interactive reference at `/docs` (Swagger UI) once the backend is running.

| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `/auth/signup` | – | Create account, returns JWT |
| POST | `/auth/login` | – | Returns JWT |
| GET | `/auth/me` | required | Current user |
| PATCH | `/auth/become-host` | required | Flip `is_host` to true |
| GET | `/amenities` | – | Fixed amenity list |
| GET | `/listings` | optional | Search/filter/paginate listings |
| GET | `/listings/{id}` | optional | Full listing detail incl. photos, amenities, host, rating, booked date ranges |
| POST | `/listings` | host | Create listing |
| PATCH | `/listings/{id}` | owner | Update listing |
| DELETE | `/listings/{id}` | owner | Delete listing |
| POST | `/listings/{id}/photos` | owner | Upload a photo file, returns its URL |
| POST | `/bookings` | required | Create booking (validates capacity + availability) |
| GET | `/bookings/me` | required | Current user's bookings |
| DELETE | `/bookings/{id}` | owner | Cancel a booking |
| POST | `/listings/{id}/reviews` | required | Review a completed stay |
| GET | `/listings/{id}/reviews` | – | List reviews for a listing |
| POST/DELETE | `/favorites/{listing_id}` | required | Toggle wishlist |
| GET | `/favorites/me` | required | Current user's wishlist |
| GET | `/host/listings` | host | Own listings + booking counts |
| GET | `/host/bookings` | host | Bookings across all owned listings |

`optional` auth means the endpoint works logged-out but personalizes the response (e.g. `is_favorited`) when a valid token is supplied.

## Deployment

The app is two independently deployable services.

**Backend → Render**
1. Push this repo to GitHub.
2. On Render: New → Web Service → point at `backend/`. Render will pick up `render.yaml` (build: `pip install -r requirements.txt`, start: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`).
3. Set env vars: `SECRET_KEY` (random string), `CORS_ORIGINS` (your Vercel frontend URL).
4. After first deploy, run `python -m app.seed` once via Render's shell to populate demo data (SQLite persists on Render's disk for the life of the service — for a longer-lived deployment, swap in Postgres by changing `DATABASE_URL`).

**Frontend → Vercel**
1. Import the repo on Vercel, set root directory to `frontend/`.
2. Set env var `NEXT_PUBLIC_API_URL` to your Render backend URL.
3. Deploy.

## Assumptions & scope notes

- **Payments are fully mocked** — "Confirm and pay" on the checkout modal creates the booking directly with no payment processor involved, per the assignment's guidance.
- **Messaging, identity verification, and live map pricing pins** are out of scope per the assignment and are not implemented as placeholders in the UI (rather than clutter the nav with "Coming soon" links, they're simply omitted).
- **Auth is simplified**: no email verification, password reset, or OAuth — just hashed-password + JWT, which is sufficient to demonstrate a real guest/host distinction as requested.
- **Images** are either pasted URLs (seed data uses `picsum.photos`) or uploaded directly to local disk storage on the backend (`static/uploads/`) rather than a real cloud bucket — swapping in S3/Cloudinary would only require changing `listings.py`'s `upload_photo` handler.
- **SQLite** was used as specified. It's suitable for this project's scope; a production deployment with concurrent writers would want Postgres (the code only touches SQLAlchemy, so this is a one-line `DATABASE_URL` change).
- **Bonus features implemented**: interactive map (Leaflet/OpenStreetMap, click-to-pin in the host form), review-after-completed-stay flow, computed Superhost badges, direct file upload for listing photos, full dark mode, and a fully responsive layout.
