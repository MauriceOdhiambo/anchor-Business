# Anchor Business Insights Consulting — Production Website

A production-oriented Next.js website for Anchor Business Insights Consulting, designed for:

- GitHub — source control
- Vercel — hosting and deployments
- Supabase — enquiry database + optional Supabase Auth for the private admin dashboard

## 1. Local setup

Requirements: Node.js 22+ and npm.

```bash
npm install
cp .env.example .env.local
npm run dev
```

Open `http://localhost:3000`.

## 2. Supabase setup

Create a Supabase project and run `supabase/schema.sql` in the Supabase SQL Editor.

Set these variables in `.env.local` and later in Vercel:

```text
NEXT_PUBLIC_SITE_URL=https://your-domain.com
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
ADMIN_EMAILS=owner@example.com
```

### Admin dashboard

1. In Supabase, enable Email/Password authentication.
2. Create an Auth user for the administrator.
3. Put that exact email in `ADMIN_EMAILS`.
4. Visit `/admin/login`.
5. Sign in with the Supabase Auth credentials.

The server verifies the authenticated email against `ADMIN_EMAILS` before reading or updating enquiries. The service-role key is server-only and must never be committed to GitHub or exposed to browser code.

## 3. GitHub

Create a repository and push this project:

```bash
git init
git add .
git commit -m "Build Anchor Business Insights production website"
git branch -M main
git remote add origin https://github.com/YOUR-USERNAME/YOUR-REPO.git
git push -u origin main
```

Do **not** enable GitHub Pages for this Next.js application. GitHub stores the source code; Vercel hosts the application.

## 4. Vercel

Import the GitHub repository into Vercel as a Next.js project. Add all variables from `.env.example` under Project Settings → Environment Variables, then deploy.

When a custom domain is connected, update `NEXT_PUBLIC_SITE_URL` to the canonical production URL and redeploy.

## 5. SEO after launch

The app generates:

- `/sitemap.xml`
- `/robots.txt`
- page metadata and canonical URLs
- Open Graph metadata
- ProfessionalService structured data
- service-specific landing pages
- insight/article pages

After deployment, verify the domain in Google Search Console and submit the sitemap. Also consider Bing Webmaster Tools and a Google Business Profile for the Eldoret location.

## 6. Content that should be replaced with verified business information

Before public launch, review the business phone numbers, email, address, office hours, domain, service wording and any claims about experience, clients, qualifications or results. Do not add fabricated testimonials, client logos or case studies.

## 7. Security notes

- Never commit `.env.local`.
- Never put `SUPABASE_SERVICE_ROLE_KEY` into client components.
- Keep `/admin` and `/api/admin` private.
- Review Supabase Auth settings before launch.
- Keep the Supabase project and Vercel credentials protected with appropriate account security.

Anchor Business Insights Consulting — Production Website
