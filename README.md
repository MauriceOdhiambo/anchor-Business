# Anchor Business Insights Consulting — Production Admin Update

This version updates the production website and admin control centre.

## Included
- Anchor logo extracted from the supplied business card and used across the public header, footer and admin area.
- Professional dark administrator sign-in screen.
- Admin dashboard with business enquiry insights.
- Separate Dashboard, Inquiries and owner-only Access Control menus.
- Client enquiry pipeline: New → Contacted → Qualified → Closed.
- Owner-managed administrator creation, roles, password reset and suspension without routine Supabase dashboard work.
- Reliable admin sign-out that returns to `/admin/login`.
- FAQ removed from the primary public navigation and sitemap.
- Existing Supabase enquiry storage and service functionality preserved.

## Deployment
1. Extract this ZIP.
2. Upload the extracted project contents to the existing GitHub repository and commit to `main`.
3. Deploy the updated repository in Vercel.
4. Keep all existing Vercel environment variables.
5. If the access-control schema has not yet been applied, run the current `supabase/schema.sql` once in Supabase. It does not remove existing contact enquiries.

Never expose `SUPABASE_SERVICE_ROLE_KEY` in client-side code or GitHub.
