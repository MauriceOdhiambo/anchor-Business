# Anchor Business Insights — combined next-step setup

This version combines the next production improvements in one deployment:

- Professional admin dashboard with enquiry totals and status counts.
- Search, service/status/date filters.
- Enquiry detail modal with email, call and WhatsApp actions.
- Responsive admin layout.
- Dashboard-managed additional admin email allow-list.
- Optional email alerts to all configured admin emails when a new enquiry arrives.
- Site-wide WhatsApp button linked to 0723 470 776.
- Improved homepage service-count card so the `09 Business services` card no longer overlaps.

## Supabase: one-time SQL update

Run the latest `supabase/schema.sql` in the Supabase SQL Editor. It keeps the existing `contact_submissions` table and adds the `admin_users` table.

Each additional admin email added in the dashboard must also have a Supabase Auth account. The dashboard controls who is authorised to access the website admin area; Supabase Auth controls the actual password/session.

## Vercel environment variables

Keep the existing variables:

- `NEXT_PUBLIC_SITE_URL`
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `ADMIN_EMAILS`

For automatic email alerts, add:

- `RESEND_API_KEY`
- `RESEND_FROM_EMAIL`

`ADMIN_EMAILS` is the recipient allow-list. Multiple emails can be separated by commas. `RESEND_FROM_EMAIL` is the verified sender address used by the email provider.

Example:

```text
ADMIN_EMAILS=firstadmin@example.com,secondadmin@example.com
RESEND_FROM_EMAIL=Anchor Website <alerts@yourverifieddomain.com>
```

Do not put `SUPABASE_SERVICE_ROLE_KEY` or `RESEND_API_KEY` in GitHub source files.

## WhatsApp

The site-wide WhatsApp button currently opens WhatsApp for `0723 470 776` using the international Kenya number `254723470776`.

If the business's WhatsApp number is different, change `site.whatsapp` and `site.whatsappUrl` in `lib/site.ts`.
