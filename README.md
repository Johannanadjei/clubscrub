# ClubScrub Home Assistance

**Professional Home Assistance, Done Right.**

A full-stack frontend MVP for the ClubScrub platform — built with React, Tailwind CSS, and Framer Motion.

## Features

### Customer App
- 🏠 Premium landing page with hero, pricing, service areas, FAQ
- 📅 8-step booking flow with live pricing calculations
- 💰 Automatic multi-day discounts (10% off for 3+ days)
- 📊 Customer dashboard with upcoming/past bookings
- ❌ Cancel and rebook functionality
- 💾 localStorage persistence

### Assistant Portal (`/assistant`)
- 📝 Multi-step signup with skills, availability, ID verification
- 📋 Job board with available bookings
- ✅ Accept, start, and complete jobs
- 💵 Real-time earnings tracker

### Admin Dashboard (`/admin`)
- 📈 Overview stats: revenue, bookings, assistants
- 📋 Full booking management (accept, assign, progress, complete)
- 👥 Assistant management
- 🔧 Manual assistant assignment

## Setup

```bash
npm install
npm run dev
```

## Deploy to Vercel

```bash
npm install -g vercel
vercel --prod
```

Or connect your GitHub repo to Vercel — it auto-detects Vite and deploys.

## Brand

- **Colors**: Black `#0A0A0A` background, Hot Pink `#EC2461` accent
- **Fonts**: Cormorant Garamond (display/headings), DM Sans (body)
- **Tone**: Premium, prestige, minimal, clean

## Pricing Logic

| Type | Cost | Zone 1 Fee | Zone 2 Fee |
|------|------|-----------|-----------|
| Half Day (3.5hrs) | GH₵ 235 | GH₵ 20/day | GH₵ 30/day |
| Full Day (7hrs) | GH₵ 465 | GH₵ 20/day | GH₵ 30/day |

- Multi-day discount: 10% off service cost for bookings > 3 days
- Service fee applies per day and is NOT discounted

## Structure

```
src/
  data/        — mock data, zones, pricing, task groups
  hooks/       — useStore (localStorage persistence)
  components/  — shared UI: Logo, Card, Avatar, StatusBadge, etc.
  pages/       — Landing, BookingFlow, Dashboard, Assistant, Admin
```
