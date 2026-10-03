# Anchor Business Insights — professional admin control centre

This version adds a dark, professional administration workspace with only admin navigation:

- Dashboard with enquiry insights and pipeline metrics.
- Inquiries workspace with search, service/status/date filters and client actions.
- Client enquiry progress from New enquiry → Contacted → Qualified → Closed.
- Access Control for the primary administrator.
- Create additional administrator/manager accounts directly from the dashboard.
- Set the initial password when creating an account.
- Reset passwords without opening Supabase.
- Suspend or restore dashboard access.
- Assign Administrator or Manager roles.
- Existing Supabase Auth users can be granted dashboard access from the dashboard.
- Public website header/footer are hidden inside the admin area.
- New enquiry email alerts can be delivered to the primary/admin recipients.
- WhatsApp actions open the business WhatsApp number directly.

## One-time Supabase SQL update

Run the latest `supabase/schema.sql` in the Supabase SQL Editor. The script preserves the existing `contact_submissions` table and adds/updates the `admin_users` access table.

The dashboard uses the Supabase service-role key on the server to create and manage Auth users. **Passwords are never stored in the `admin_users` table.** The primary administrator controls passwords through the protected dashboard.

The primary administrator is the email address in `ADMIN_EMAILS`. That account has owner-level access to the Access Control section.

## Vercel environment variables

Keep:

- `NEXT_PUBLIC_SITE_URL`
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `ADMIN_EMAILS`

For enquiry email alerts:

- `RESEND_API_KEY`
- `RESEND_FROM_EMAIL`

Example:

```text
ADMIN_EMAILS=owner@example.com
RESEND_FROM_EMAIL=Anchor Website <alerts@yourverifieddomain.com>
```

`ADMIN_EMAILS` defines the primary owner account and also receives enquiry alerts. Active dashboard-managed administrators are also included in enquiry alert recipients.

Never put `SUPABASE_SERVICE_ROLE_KEY` or `RESEND_API_KEY` in GitHub.

## Adding an administrator

1. Sign in to `/admin` using the primary administrator account.
2. Open **Access control**.
3. Enter the person's email.
4. Set an initial password.
5. Select **Administrator** or **Manager**.
6. Create the account.
7. Give the password to the person through a secure channel.

No Supabase dashboard visit is required for normal administrator creation, password resets, role changes or suspension.

If the email already has a Supabase Auth account, the dashboard can grant it admin access instead of creating a duplicate account.

## WhatsApp

The site and admin client actions currently use `0723 470 776` / `254723470776`. Change `site.whatsapp` and `site.whatsappUrl` in `lib/site.ts` if the business confirms another WhatsApp number.

## Roles

- **Owner:** the email in `ADMIN_EMAILS`; can view insights, manage enquiries and control administrator access.
- **Administrator:** can work with the dashboard and enquiries but cannot change administrator access.
- **Manager:** focused on enquiries/client follow-up; administrator access is hidden.
