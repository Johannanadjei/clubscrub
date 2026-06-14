# ClubScrub Home Assistance — Project Rules for Claude

## What is this project?
ClubScrub is a premium home assistance booking platform based in Accra, Ghana.
Customers book trained ClubScrub Assistants for half-day or full-day sessions.
This is a real business. Code must be production-quality at all times.

---

## Tech Stack

| Layer | Tool | Why |
|-------|------|-----|
| Frontend | React + Vite | Fast, modern |
| Styling | Tailwind CSS | Utility-first, consistent |
| Animation | Framer Motion | Smooth, premium feel |
| Database | Supabase | Postgres + Auth, free tier |
| Email | Resend | Reliable transactional email |
| Hosting | Vercel | Auto-deploys from GitHub |
| Auth | Supabase Auth | Built-in, secure |

**Never suggest alternatives to this stack without being asked.**

---

## Brand Rules — Never Break These

- **Business name:** ClubScrub Home Assistance
- **Tagline:** "Professional Home Assistance, Done Right."
- **Staff are called:** "ClubScrub Assistants" — NEVER "maids"
- **Primary color:** `#EC2461` (hot pink)
- **Background:** `#0A0A0A` (near black)
- **Display font:** Cormorant Garamond (italic, serif)
- **Body font:** DM Sans (clean, modern)
- **Tone:** Premium, calm, trustworthy — NOT cheap or marketplace-y
- **Target audience:** Expats, busy professionals, higher-income households, Airbnb hosts in Accra

---

## Pricing Logic — Always Implement Exactly (v2: task-based hourly)

Pricing is driven by the **estimated time** of the tasks a customer selects. Each
task has an estimated duration; selected durations sum to a total time, which maps
to a price:

| Time | Price |
|------|-------|
| Up to 3 hours (minimum booking) | GH₵ 349 |
| Each additional hour (rounded UP) | + GH₵ 100 |
| Sunday booking | + GH₵ 50 weekend surcharge |

**Worked examples (implement exactly):**
- 3 hrs → GH₵ 349
- 3.5 hrs → GH₵ 449 (0.5h over → rounds up to 1 extra hour)
- 4 hrs → GH₵ 449
- 4.5 hrs → GH₵ 549 (1.5h over → rounds up to 2 extra hours)

**Rules:**
- Minimum booking is always GH₵ 349 (applies even with zero tasks selected).
- Extra time is rounded UP to the next whole hour.
- **Sunday surcharge:** a flat GH₵ 50 is added to the total for any booking whose
  date falls on a Sunday. Saturdays are closed (not bookable). The surcharge is
  applied in `calcBooking()` (never hardcoded in components) and shown as a
  separate line item everywhere the total appears.
- **No zone fees.** Zones are used for area/coverage selection only — they do NOT
  add to the price.
- **No multi-day discount.** Each booking is a single session; there is no
  multi-day concept in v2.
- Show the estimated time and price live as tasks are selected (sticky bar).
- All pricing logic lives in `calcEstimate()` in `/src/data/index.js` — never
  hardcode prices in components.

---

## Service Zones

**Zone 1 (coverage only — no fee):**
East Legon, Airport Residential, Cantonments, Osu, Labone, Ridge, Dzorwulu, Roman Ridge, North Ridge, Abelemkpe, Adjiringanor, Shiashie

**Zone 2 (coverage only — no fee):**
Madina, Adenta, Spintex, Teshie, Achimota, Dansoman, Legon, Haatso, West Legon, Tesano, Taifa, North Kaneshie, South Kaneshie, Bortianor

**Outside zones:** Show "We currently do not service this location." — do NOT block the booking, flag it for admin review instead.

---

## User Model

### Customer (Guest or Registered)
- Can book without an account (guest)
- After booking confirmation, offered account creation (email pre-filled from booking)
- Registered users can track bookings, view history, manage profile
- Auth via Supabase (email + password)

### Admin (ClubScrub team only)
- Access via /admin (password protected)
- Can view all bookings, update statuses, assign assistants
- Receives email notification for every new booking

### Staff / Assistants
- Managed internally by admin only
- No customer-facing assistant profiles
- No assistant app or portal

---

## Notifications

- Every new booking → email to **info@club-scrub.com**
- Email must include: booking reference, customer name, phone, address, service type, date, time, tasks, total
- Use **Resend** for sending emails
- Customer receives booking confirmation email automatically

---

## Database Tables (Supabase)

### bookings
id, reference, user_id (nullable for guests), type, days, zone, area, date, time_slot, tasks, notes, status, subtotal, discount, service_fee, total, payment_method, address_verified (bool), created_at

### customers
id (= supabase auth uid), full_name, email, phone, address, created_at

### assistants (admin-managed only)
id, name, phone, area, zone, status, rating, jobs_completed

---

## Booking Statuses
`pending` → `accepted` → `in_progress` → `completed` | `cancelled`

Status is updated by admin only — never auto-updated by the frontend.

---

# DATE & CALENDAR RULES

- **Never allow past dates.** Minimum selectable date is always today.
- **Same-day booking cutoff:** If it is past 12:00 PM Ghana time (GMT), today is no longer bookable. Minimum becomes tomorrow.
- **Advance booking limit:** Maximum 60 days in advance.
- **Minimum notice:** Bookings must be made at least 24 hours in advance at all times.
- **Saturdays — CLOSED:** Saturdays are never bookable. They must be greyed out, struck through, and unselectable in the calendar. If a Saturday date is somehow submitted (e.g. via API), reject it with: "We're closed on Saturdays. Please choose another day."
- **Sundays — weekend surcharge:** Sundays are bookable but add a flat **GH₵ 50** surcharge (see Pricing). The calendar must flag Sundays with a subtle indicator (small pink dot) and a tooltip/note "Weekend surcharge: +GH₵ 50" before selection. When a Sunday is selected, show "Sunday booking — GH₵ 50 weekend surcharge applies". The surcharge appears as a separate line item in the summary, confirmation, and admin email, and is included in the Paystack payment amount.
- **Blackout days:** Admin can mark dates as unavailable (stored in Supabase). Blocked dates must be visually greyed out and unselectable — never just hidden.
- **Public holidays:** Visually flag Ghana public holidays on the calendar with a subtle indicator. Still bookable unless admin has blocked them.
- **Multi-day bookings:** Each day in the range must be individually valid. If any day in a range is blocked, warn the customer before they proceed — never silently skip days.
- **Calendar UI:** Never use a plain HTML `<input type="date">` for customer-facing booking. Always use a custom calendar component that enforces all rules visually.
- **Past date error:** If somehow a past date is submitted (e.g. via API): "Please select a future date. We require at least 24 hours notice."
- **Display format:** Always show dates as DD/MM/YYYY in Ghana format (e.g. 20/05/2026).

---

# FORM VALIDATION RULES

## General Principles
- Validate on blur (when the user leaves a field) — not on every keystroke.
- Show inline error messages directly below the relevant field. Never rely on toast or alert only.
- Error messages must be human, friendly, and specific. Never show raw technical errors.
- Required fields must be clearly marked with a visible indicator.
- The submit / continue button is disabled until all required fields in the current step pass validation.
- On mobile, auto-scroll to the first invalid field on attempted submit.
- Never clear a field's value when showing an error — the user's input is preserved.
- Re-validate a field as soon as the user corrects it (don't wait for another blur).

## Full Name
- Required
- Minimum 2 characters
- Must contain at least a first and last name (space between words)
- No numbers or special characters except hyphens and apostrophes (O'Brien, Mensah-Bonsu)
- Error: "Please enter your full name (first and last name)"

## Email
- Required
- Standard email format (must contain @ and valid domain)
- Lowercase on submission
- Error: "Please enter a valid email address"
- On registration: check if email already exists → "An account with this email already exists. Log in instead?" with a login link inline

## Phone Number
- Required
- Ghana mobile numbers only
- Valid prefixes: 020, 024, 025, 026, 027, 050, 054, 055, 056, 057, 059
- Accept formats: 024 000 0000 / 0240000000 / +233240000000
- Strip spaces and dashes before validation
- Normalise to local format (0XX XXX XXXX) on display
- Error: "Please enter a valid Ghana mobile number (e.g. 024 000 0000)"

## Address
- Required
- Minimum 10 characters
- Must not be a zone/area name alone (e.g. "East Legon" by itself fails)
- Must not be all numbers
- See full Address Validation Rules section below
- Error: "Please add more detail — include a house number, street, or landmark"

## Date
- See Date & Calendar Rules above
- Error: "Please select a date at least 24 hours from now"

## Payment Method
- Required selection before final submission
- If Mobile Money selected: prompt for MoMo number and validate as Ghana mobile number
- Error: "Please select a payment method to continue"

## Task Selection
- Not required — customer can proceed with zero tasks selected
- If no tasks selected: show a soft non-blocking warning:
  > "You haven't selected any tasks. Your assistant will follow up before the appointment to confirm priorities."
- This is never a blocker.

---

# ADDRESS VALIDATION & VERIFICATION RULES

Ghana addresses are non-standard. Many customers will write informal addresses such as:
- "Near the Shell station, East Legon"
- "Behind Papaye, Osu"
- "Devtraco Estate, Block C, Spintex"
- "House 7, Boundary Road, Tesano"

**This is normal and expected. Never reject an address for being informal.**

## Rules

1. **Never block a booking because of an address.** The process must always complete regardless of address format.

2. **Basic validation only:**
   - Minimum 10 characters
   - Must not be a zone or area name alone
   - Must not be all numbers
   - Must not be empty

3. **Soft prompt (not an error) for short or vague addresses:**
   > "Your address looks a bit brief. Adding a landmark or street name helps your assistant find you easily."
   Customer can dismiss and continue. Never a blocker.

4. **Flag unverifiable addresses for admin:** Set `address_verified = false` in the database. Admin sees this flag and knows to call the customer to confirm location before the appointment.

5. **Ghana Digital Address (GhanaPostGPS) — optional field:**
   - Format: XX-XXXX-XXXX (e.g. GA-123-4567)
   - Validate the format if entered, but never require it
   - Label it clearly: "Ghana Post GPS (optional) — helps your assistant find you faster"

6. **Admin notification:** Confirmation email to admin must highlight unverified addresses with a clear flag so the team can follow up before the appointment day.

7. **Future:** Integrate Google Places API restricted to Ghana for address autocomplete — not in current scope.

---

# ERROR HANDLING RULES

## General Principles
- Every error must be caught. No unhandled promise rejections. No blank screens. No silent failures.
- Every customer-facing error must be in plain, friendly English.
- Log technical errors to the browser console in development. In production, errors should go to a logging service (Sentry — future).
- Never show raw error objects, stack traces, or HTTP status codes to customers.
- All async operations (Supabase calls, email sends, API calls) must have try/catch blocks.
- Network errors must be handled gracefully.

## Error Message Tone

❌ Never:
- "Error 422: Unprocessable Entity"
- "null is not an object"
- "Request failed with status code 500"

✅ Always:
- "Something went wrong with your booking. Please try again or contact us at info@club-scrub.com"
- "We couldn't load your bookings. Please refresh the page."
- "We're having trouble connecting. Please check your internet and try again."

## Error Types & Handling

### Network / connectivity errors
- Show a non-blocking banner at the top of the screen
- "Having trouble connecting. Please check your internet and try again."
- Include a retry button where relevant

### Form submission errors
- Inline message below the relevant field
- Never clear the form on error — preserve all user input
- Scroll to the first error automatically on mobile

### Authentication errors
- Wrong credentials: "Incorrect email or password. Please try again." (never specify which field is wrong — security best practice)
- Rate limiting: "Too many login attempts. Please wait a few minutes before trying again."
- Expired session: "Your session has expired. Please log in again." — then redirect to login, preserve the page they were on

### Booking save errors
- "We couldn't confirm your booking. Please try again."
- "If the problem continues, contact us at info@club-scrub.com"
- Never charge or send confirmation emails if the booking failed to save

### Empty states (handle consistently — not errors but designed intentionally)
- No upcoming bookings: "You have no upcoming bookings. Ready to book your next clean?" + Book Now CTA
- No past bookings: "Your completed bookings will appear here."
- Admin no pending: "All caught up. No pending bookings right now."

---

# PAYMENT & FAILED PAYMENT RULES

## Current Payment Methods (no in-app processing yet)
- Mobile Money: MTN MoMo, Vodafone Cash, AirtelTigo Money
- Cash on arrival
- Bank transfer

## Payment Flow
- Payment is NOT processed in-app at this stage
- When customer selects Mobile Money: capture their MoMo number for admin reference
- Admin follows up manually to collect payment
- Future: integrate **Paystack** (Ghana's leading payment gateway) for in-app processing

## Failed / Unpaid Booking Handling
- If MoMo selected but payment not received before appointment:
  - Admin marks booking as `payment_pending` in admin panel
  - System sends reminder email to customer: "Your booking is confirmed but payment hasn't been received yet. Please send GH₵ [amount] to [number] before your appointment to avoid cancellation."
- If payment never arrives: admin cancels with reason `payment_not_received`
- All payment-related cancellations are logged with reason and visible in admin

## Refund Policy (display only — no automated refunds yet)
- Show clearly in booking confirmation and terms:
  > "Cancellations made more than 24 hours before your appointment are fully refunded. Cancellations within 24 hours of the appointment are non-refundable."
- Admin handles refunds manually via MoMo or bank transfer

---

# MOBILE DESIGN RULES (iOS & ANDROID)

## General
- Mobile-first always. Design at 390px (iPhone 14 base), validate at 360px (Android baseline).
- All touch targets: minimum 44×44px — Apple HIG and Google Material Design standard. Never smaller.
- No hover-only interactions. Every interactive element must work on touch alone.
- Bottom navigation bar must respect iOS safe areas: `padding-bottom: env(safe-area-inset-bottom)`.
- Sticky CTAs (Book Now, Continue) float above the keyboard on mobile — use `position: fixed` at bottom with safe area padding.

## iOS-Specific
- Respect notch / Dynamic Island: `padding-top: env(safe-area-inset-top)` on fixed headers.
- Do NOT use `position: fixed` inside overflow-scroll containers — it breaks on iOS Safari. Use `-webkit-overflow-scrolling: touch` on scroll containers instead.
- **Input zoom prevention:** All form inputs must have `font-size: 16px` minimum. iOS Safari auto-zooms on inputs smaller than 16px — this is never acceptable.
- Tap highlight: `-webkit-tap-highlight-color: transparent` on all interactive elements.
- Test all date pickers on iOS Safari specifically — native `<input type="date">` behaves differently and must be overridden by our custom calendar.

## Android-Specific
- Android hardware back button: must navigate backward through booking flow steps, not exit the app entirely.
- Keyboard behaviour: when keyboard opens, the focused input must scroll into view. Use `scrollIntoView({ behavior: 'smooth', block: 'center' })` on input focus.
- No Material Design ripple needed — our Framer Motion tap animations are sufficient.

## Forms on Mobile
- Always single-column layout on mobile.
- Labels always above inputs — never placeholder-only labels (fails accessibility and disappears on focus).
- Use correct input types: `type="tel"` for phone, `type="email"` for email. Never `type="text"` for these.
- Custom calendar replaces `type="date"` everywhere.
- Keyboard "Next" / "Done" button should advance to the next field or submit — use `returnKeyType` patterns.
- Never show more than one booking flow step at once on mobile.

## Loading & Performance
- No layout shift (CLS) on load — always reserve space for async content.
- Skeleton loaders for all async content. Never a blank flash or spinner alone.
- Booking flow steps feel instant — pre-render the next step in background where possible.
- Images must be lazy-loaded and appropriately sized.

---

# ACCESSIBILITY RULES

- All images must have descriptive alt text.
- All interactive elements must be keyboard-navigable (Tab, Enter, Space, Escape).
- Colour contrast ratio: minimum 4.5:1 for normal text, 3:1 for large text (WCAG AA).
- Error messages linked to inputs via `aria-describedby`.
- Loading states announced to screen readers via `aria-live="polite"`.
- All forms use proper `<label>` elements — never placeholder text as the only label.
- Modal dialogs must trap focus and be dismissible with Escape.
- Booking flow progress must be announced to screen readers.

---

# SECURITY RULES

- Never expose Supabase service role key in frontend — anon key only in client code.
- All environment variables via Vite: prefix with `VITE_`. Never hardcode keys.
- Row Level Security (RLS) enabled on ALL Supabase tables:
  - Customers can only read/write their own rows
  - Guests (unauthenticated) can insert bookings but not read others'
  - Admins have full access via service role on server side only
- Admin panel requires authentication — never publicly accessible.
- Never log sensitive data (passwords, MoMo PINs, full phone numbers) to console.
- Rate limiting on auth: Supabase handles by default — do not disable.
- Sanitise all user inputs before storing — no raw HTML in database fields.

---

# CODE RULES

1. **Mobile-first always.** Design at 390px, scale up.
2. **Tailwind for styling.** Inline styles only as a last resort.
3. **Components in `/src/components/`, pages in `/src/pages/`.**
4. **No hardcoded prices or zone data in components.** Always import from `/src/data/index.js`.
5. **All Supabase calls in `/src/lib/supabase.js`** — never directly in components.
6. **Loading + error + empty states required** on every async component.
7. **Never expose API keys.** Use `VITE_` env variables only.
8. **Framer Motion for all page transitions and card reveals.**
9. **Validate before submit.** Never send an invalid form.
10. **Currency: always `GH₵ X,XXX`** using `.toLocaleString()`.
11. **Dates: always DD/MM/YYYY** format for display.
12. **Never auto-submit.** Always require explicit user action.
13. **Confirm before destructive actions** (cancel booking, delete account).
14. **Skeleton loaders** on all async content — no blank flashes.
15. **No console errors in production.** All errors caught and handled.

---

## File Structure

```
src/
  components/     # Shared UI (Button, Card, Input, Calendar, Skeleton, etc.)
  pages/          # Route-level pages
  data/           # Static data: zones, pricing, tasks, holidays
  lib/            # Supabase client, Resend email helpers, validation utils
  hooks/          # useBookings, useAuth, useForm, useCalendar, etc.
  utils/          # calcPricing, formatCurrency, validatePhone, formatDate
```

---

## Environment Variables (never commit — always in .env.local)

```
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
VITE_RESEND_API_KEY=
```

---

## What NOT to Build (unless explicitly asked)

- ❌ Assistant-facing app or portal
- ❌ In-app card payment (use Paystack when ready — future)
- ❌ Chat or messaging features
- ❌ Google Maps integration (future)
- ❌ Push notifications (future)
- ❌ Services outside Accra (future)

---

## Definition of Done

Every feature must pass ALL of these before it is considered complete:

- [ ] Mobile-responsive at 390px and 360px
- [ ] Skeleton / loading state implemented
- [ ] Error state with friendly human message
- [ ] Empty state designed and implemented
- [ ] Full form validation with inline errors
- [ ] No past dates selectable in calendar
- [ ] Address validation with soft prompt (never a blocker)
- [ ] All touch targets ≥ 44×44px
- [ ] iOS safe area insets respected
- [ ] No input zoom on iOS (font-size ≥ 16px)
- [ ] Correct brand colours and fonts throughout
- [ ] No console errors in production build
- [ ] Vercel build passes with zero errors

---

## Next Steps (priority order)

1. Set up Supabase project + tables + RLS policies
2. Add Supabase auth (sign up, log in, log out, session persistence)
3. Replace localStorage with Supabase database
4. Post-booking account creation flow (guest → registered, email pre-filled)
5. Email notifications via Resend (admin notification + customer confirmation)
6. Custom calendar component enforcing all date rules
7. Full form validation across all booking steps
8. Admin panel with live data + payment status management
9. Paystack payment integration (in-app MoMo + card)
