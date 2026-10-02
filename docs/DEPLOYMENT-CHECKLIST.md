# Anchor Business Insights — launch checklist

## Before pushing to GitHub

- [ ] Review `lib/site.ts` and confirm the phone numbers, email, address, hours and service wording.
- [ ] Decide the production domain and set `NEXT_PUBLIC_SITE_URL` in Vercel.
- [ ] Do not commit `.env.local` or any Supabase service-role key.
- [ ] Replace any content that implies qualifications, client results, testimonials or experience unless verified.

## Supabase

- [ ] Create the Supabase project.
- [ ] Run `supabase/schema.sql`.
- [ ] Enable Email/Password authentication.
- [ ] Create the administrator Auth user.
- [ ] Add the exact administrator email to `ADMIN_EMAILS`.
- [ ] Copy the project URL and anon key into Vercel.
- [ ] Copy the service-role key only into Vercel as `SUPABASE_SERVICE_ROLE_KEY`.

## Vercel

- [ ] Import the GitHub repository as a Next.js project.
- [ ] Add all environment variables.
- [ ] Deploy.
- [ ] Test `/`, `/services`, `/contact`, `/insights`, `/privacy` and `/terms`.
- [ ] Submit a test contact enquiry.
- [ ] Confirm the enquiry appears in `/admin`.
- [ ] Test the admin status update.

## Search

- [ ] Confirm `https://YOUR-DOMAIN/sitemap.xml` loads.
- [ ] Confirm `https://YOUR-DOMAIN/robots.txt` loads.
- [ ] Add the domain to Google Search Console.
- [ ] Submit the sitemap.
- [ ] Set up and verify the business's Google Business Profile.
- [ ] Ensure the public business name, address and phone are consistent across the website and business listings.
