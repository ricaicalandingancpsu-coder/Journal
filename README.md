# Dear Diary

A private digital journal: write daily entries, track moods, tag and search, browse by calendar and keep photo memories.

**Stack:** React 18 + React Router + Tailwind CSS 3 + Lucide icons (frontend) · Laravel 12 REST API with Sanctum SPA cookie auth · MySQL.

React is built by Vite and served by Laravel from the same origin, so Sanctum's cookie-based SPA authentication (session cookie + CSRF) applies. No tokens are stored in the browser.

## Requirements

- PHP 8.2+ with `pdo_mysql`, `fileinfo`, `mbstring` (XAMPP's PHP works)
- Composer 2
- Node 18+ and npm
- MySQL / MariaDB (XAMPP's MySQL works)

## Setup

```bash
# 1. Dependencies
composer install
npm install

# 2. Environment
cp .env.example .env          # Windows PowerShell: Copy-Item .env.example .env
php artisan key:generate
```

Edit `.env` if your MySQL differs from the XAMPP defaults:

```
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=dear_diary
DB_USERNAME=root
DB_PASSWORD=
```

```bash
# 3. Create the database (or use phpMyAdmin)
mysql -u root -e "CREATE DATABASE dear_diary CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci"

# 4. Tables (optionally with a clearly-labelled demo account)
php artisan migrate
php artisan db:seed            # optional: demo@deardiary.test / password
```

### File storage

Uploads (cover images, memories) are stored on Laravel's private `local` disk (`storage/app/private`). They are **not** publicly linked; the API streams them only to their owner, so `php artisan storage:link` is not needed. Make sure `storage/` is writable.

## Run

```bash
php artisan serve --port=8000     # backend + SPA, http://127.0.0.1:8000
npm run dev                       # Vite dev server with hot reload (second terminal)
```

Open the Laravel URL (not the Vite one). For a production-style build run `npm run build` instead of `npm run dev`.

If port 8000 is busy, pass another `--port`; stateful domains in `.env` accept any port on `localhost`/`127.0.0.1`. If you serve from a real domain, set `APP_URL` and `SANCTUM_STATEFUL_DOMAINS` to it.

## Environment variables

| Variable | Purpose |
| --- | --- |
| `DB_*` | MySQL connection |
| `APP_URL` | Base URL, used in emailed links |
| `SANCTUM_STATEFUL_DOMAINS` | Hosts allowed to use cookie auth |
| `MAIL_*` | Mail transport for password recovery |
| `VITE_CONTACT_EMAIL` | Optional; shown on the Contact page |

### Password recovery

Works through Laravel's mail system. With the default `MAIL_MAILER=log`, the reset email (with its link) is written to `storage/logs/laravel.log`. Configure SMTP in `.env` for real delivery. The "forgot password" response is identical whether or not the email exists.

## Tests

```bash
php artisan test
```

12 feature tests cover registration/login/logout, validation, entry CRUD with tags and cover upload, filters/sorting, dashboard metrics, memories, profile/password/preferences, password reset, and **cross-user authorization** (a second user gets 403 on another user's entries, covers, memories and tags).

## Features

- Public homepage: nav, hero, features, sample cards (marked as demo), how it works, about, footer, Privacy and Contact pages
- Registration, login (rate-limited), logout, password reset, protected routes
- Dashboard: real totals, this-month count, writing streak, recent entries, 30-day mood summary
- Journal CRUD: title, content, date, mood, tags, cover image; private by default; search, mood/tag/date filters, sorting, pagination; delete confirmation
- Calendar: month browsing, per-day entries, write for a date
- Memories: upload (JPG/PNG/WebP/GIF, 5 MB), caption/title/date editing, replace image, delete, search
- Settings: name, email, password, theme (Cream/Blush/Lavender/Night), text size, logout

## Security notes

- Every record has a `user_id`; Laravel policies enforce ownership on show/update/delete and on file routes; list queries are scoped to the user.
- Tags are resolved per user, so one user can never attach another user's tag.
- CSRF protection is active for all state-changing API calls (verified: missing token returns 419).
- Entry text is rendered as plain text by React (no HTML injection).
- Secrets live only in `.env`; nothing sensitive is in frontend code.

## Limitations

- Entries are plain text (no rich-text formatting); visibility is private-only, there is no sharing.
- No account deletion or email verification yet.
- No image resizing/thumbnails (the GD extension isn't required).
- Streak and "today" use the browser's date; entry dates are calendar dates without time zones.
- Browser-tested on Edge (Chromium) via an automated run; Firefox/Safari not exercised.
