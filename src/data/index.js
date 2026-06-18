// ===========================================================================
// ClubScrub — data & pricing (v2: task-based hourly model)
// ===========================================================================

// Service areas. A flat list of covered areas — no zone tiers and no zone fee
// (price is purely time-based). Area selection does not affect the price.
export const ZONES = [
  'Cantonments',
  'Labone',
  'Airport Residential Area',
  'Roman Ridge',
  'East Airport',
  'Osu',
  'Dzorwulu',
  'East Legon',
  'Trasacco Valley',
  'Airport Hills',
  'Spintex',
]

// ---------------------------------------------------------------------------
// PRICING (task-based hourly)
//   - Minimum booking: GH₵ 349 for up to 3 hours
//   - Additional time: GH₵ 100 per extra hour, rounded UP
//   Examples: 3h = 349 · 3.5h = 449 · 4h = 449 · 4.5h = 549
// ---------------------------------------------------------------------------
export const PRICING = {
  base: 349,        // GH₵ — covers up to baseHours
  baseHours: 3,     // hours included in the base price
  hourlyRate: 100,  // GH₵ per extra hour (rounded up)
}

// Weekend rules:
//  - Saturday: closed (not bookable).
//  - Sunday: bookable, with a flat surcharge added to the total.
export const SUNDAY_SURCHARGE = 50 // GH₵

// ---------------------------------------------------------------------------
// TASK GROUPS — each task carries an estimated duration in minutes.
// Selected tasks sum to an estimated time, which drives the price.
// ---------------------------------------------------------------------------
export const TASK_GROUPS = [
  {
    id: 'kitchen', label: 'Kitchen',
    tasks: [
      { id: 'k_dishes',    label: 'Wash dishes',                 mins: 30 },
      { id: 'k_counters',  label: 'Clean countertops & stovetop', mins: 20 },
      { id: 'k_sink',      label: 'Scrub sink',                  mins: 10 },
      { id: 'k_cabinets',  label: 'Wipe cabinet fronts',         mins: 15 },
      { id: 'k_microwave', label: 'Clean microwave',             mins: 10 },
      { id: 'k_floor',     label: 'Sweep & mop floor',           mins: 20 },
      { id: 'k_trash',     label: 'Take out trash',              mins: 5  },
    ],
  },
  {
    id: 'laundry', label: 'Laundry',
    tasks: [
      { id: 'l_wash', label: 'Wash a load',        mins: 15 },
      { id: 'l_hang', label: 'Hang / dry clothes', mins: 15 },
      { id: 'l_fold', label: 'Fold & put away',    mins: 20 },
    ],
  },
  {
    id: 'ironing', label: 'Ironing',
    tasks: [
      { id: 'i_small',  label: 'Iron up to 10 items', mins: 30 },
      { id: 'i_large',  label: 'Iron up to 25 items', mins: 60 },
      { id: 'i_linens', label: 'Iron bed linens',     mins: 20 },
    ],
  },
  {
    id: 'bedrooms', label: 'Bedrooms',
    tasks: [
      { id: 'b_make',   label: 'Make beds',          mins: 10 },
      { id: 'b_linens', label: 'Change bed linens',  mins: 15 },
      { id: 'b_dust',   label: 'Dust surfaces',      mins: 10 },
      { id: 'b_tidy',   label: 'Tidy & organise',    mins: 20 },
      { id: 'b_floor',  label: 'Sweep / vacuum floor', mins: 15 },
      { id: 'b_mop',    label: 'Mop floor',          mins: 15 },
    ],
  },
  {
    id: 'living', label: 'Living Areas',
    tasks: [
      { id: 'lv_dust',   label: 'Dust surfaces',        mins: 15 },
      { id: 'lv_tidy',   label: 'Tidy & declutter',     mins: 20 },
      { id: 'lv_vacuum', label: 'Sweep / vacuum',       mins: 15 },
      { id: 'lv_mop',    label: 'Mop floors',           mins: 15 },
      { id: 'lv_tables', label: 'Wipe tables & surfaces', mins: 10 },
      { id: 'lv_glass',  label: 'Clean glass & mirrors', mins: 10 },
    ],
  },
  {
    id: 'bathrooms', label: 'Bathrooms',
    tasks: [
      { id: 'ba_toilet',  label: 'Clean toilet',        mins: 15 },
      { id: 'ba_sink',    label: 'Clean sink & counter', mins: 10 },
      { id: 'ba_shower',  label: 'Clean shower / bath',  mins: 20 },
      { id: 'ba_mirror',  label: 'Clean mirror',         mins: 5  },
      { id: 'ba_floor',   label: 'Mop floor',            mins: 10 },
      { id: 'ba_restock', label: 'Restock & tidy',       mins: 5  },
    ],
  },
  {
    id: 'extras', label: 'Extras',
    tasks: [
      { id: 'e_windows',  label: 'Interior windows',     mins: 30 },
      { id: 'e_skirting', label: 'Wipe skirting boards', mins: 20 },
      { id: 'e_balcony',  label: 'Balcony / patio tidy', mins: 20 },
      { id: 'e_fridge',   label: 'Wipe inside fridge',   mins: 20 },
      { id: 'e_wardrobe', label: 'Organise a wardrobe',  mins: 30 },
    ],
  },
]

// Flat lookups built from TASK_GROUPS.
export const ALL_TASKS = TASK_GROUPS.flatMap(g => g.tasks)
const TASK_MINUTES = Object.fromEntries(ALL_TASKS.map(t => [t.id, t.mins]))
const TASK_LABELS = Object.fromEntries(ALL_TASKS.map(t => [t.id, t.label]))

export function taskLabel(id) { return TASK_LABELS[id] || id }
export function taskLabels(ids = []) { return ids.map(taskLabel) }

// ---------------------------------------------------------------------------
// QUICK SELECTS — preset bundles that auto-select a set of tasks.
// ---------------------------------------------------------------------------
export const QUICK_SELECTS = [
  {
    id: 'quick_refresh',
    label: 'Quick Refresh',
    sub: 'A light tidy across the essentials',
    tasks: ['k_dishes','k_counters','lv_tidy','lv_vacuum','ba_toilet','ba_sink','b_make'],
  },
  {
    id: 'home_reset',
    label: 'Home Reset',
    sub: 'A thorough clean of the whole home',
    tasks: ['k_dishes','k_counters','k_sink','k_floor','lv_dust','lv_tidy','lv_vacuum','lv_mop',
            'ba_toilet','ba_sink','ba_shower','ba_floor','b_make','b_dust','b_floor','b_mop'],
  },
  {
    id: 'family_catch_up',
    label: 'Family Catch-Up',
    sub: 'Laundry, ironing & kitchen sorted',
    tasks: ['k_dishes','k_counters','k_floor','k_sink','l_wash','l_hang','l_fold','i_large',
            'b_make','b_linens','b_dust','lv_tidy','lv_vacuum','lv_mop','ba_toilet','ba_sink','ba_shower'],
  },
]

// ---------------------------------------------------------------------------
// SIGNATURE RESETS — premium, room-based bundles shown on the landing page.
// Each Reset is a curated set of tasks presented as a polished landscape card.
// ---------------------------------------------------------------------------
export const RESETS = [
  {
    id: 'kitchen',
    name: 'Kitchen Reset',
    description: 'A beautifully presented kitchen, ready for the day ahead.',
    tasks: ['Wash dishes', 'Clean countertops & stovetop', 'Clean sink', 'Wipe appliance exteriors', 'Empty bin', 'Sweep & mop floor', 'Tidy & declutter'],
    // Real task ids drive the (unchanged) pricing engine via calcEstimate().
    taskIds: ['k_dishes', 'k_counters', 'k_sink', 'k_cabinets', 'k_microwave', 'k_floor', 'k_trash'],
    timeRange: '~2–3 hrs',
    img: '/resets/kitchen.jpg',
  },
  {
    id: 'bedroom',
    name: 'Bedroom Reset',
    description: 'A calm, hotel-inspired bedroom experience.',
    tasks: ['Make beds', 'Change bed linen', 'Fold & put away clothes', 'Dust surfaces', 'Sweep & mop floor', 'Tidy & declutter'],
    taskIds: ['b_make', 'b_linens', 'l_fold', 'b_dust', 'b_floor', 'b_mop', 'b_tidy'],
    timeRange: '~2–3 hrs',
    img: '/resets/bedroom.jpg',
  },
  {
    id: 'bathroom',
    name: 'Bathroom Reset',
    description: 'A polished, spa-standard bathroom.',
    tasks: ['Clean toilet', 'Clean sink & mirror', 'Clean shower / bath', 'Arrange towels', 'Sweep & mop floor'],
    taskIds: ['ba_toilet', 'ba_sink', 'ba_mirror', 'ba_shower', 'ba_floor', 'ba_restock'],
    timeRange: '~1–2 hrs',
    img: '/resets/bathroom.jpg',
  },
  {
    id: 'living',
    name: 'Living Space Reset',
    description: 'A welcoming, guest-ready living environment.',
    tasks: ['Dust surfaces', 'Tidy & declutter', 'Sweep & mop floor', 'Arrange soft furnishings'],
    taskIds: ['lv_dust', 'lv_tidy', 'lv_vacuum', 'lv_mop', 'lv_tables', 'lv_glass'],
    timeRange: '~1–2 hrs',
    img: '/resets/living.jpg',
  },
  {
    id: 'full',
    name: 'Full Home Reset',
    description: 'Our complete Signature Reset — every room, every detail.',
    tasks: ['Wash dishes', 'Clean countertops & stovetop', 'Clean sink', 'Sweep & mop floor', 'Make beds', 'Change bed linen', 'Fold & put away clothes', 'Dust surfaces', 'Clean toilet', 'Clean shower / bath', 'Tidy & declutter'],
    taskIds: ['k_dishes', 'k_counters', 'k_sink', 'k_floor', 'b_make', 'b_linens', 'l_fold', 'b_dust', 'b_mop', 'ba_toilet', 'ba_shower', 'ba_floor', 'lv_dust', 'lv_tidy', 'lv_vacuum', 'lv_mop'],
    timeRange: '~4–5 hrs',
    img: '/resets/full.jpg',
  },
  {
    id: 'guest',
    name: 'Guest Ready Reset',
    description: 'Perfect before guests arrive, events, or hosting.',
    tasks: ['Tidy & declutter', 'Dust surfaces', 'Sweep & mop floor', 'Clean toilet', 'Clean sink & mirror', 'Wash dishes', 'Clean countertops & stovetop', 'Arrange soft furnishings'],
    taskIds: ['lv_tidy', 'lv_dust', 'lv_vacuum', 'lv_mop', 'ba_toilet', 'ba_sink', 'ba_mirror', 'k_dishes', 'k_counters', 'lv_tables'],
    timeRange: '~2–3 hrs',
    img: '/resets/guest.jpg',
  },
]

export const EXCLUDED_TASKS = [
  'Deep cleaning','Heavy grease removal','Oven interior cleaning',
  'Fridge deep cleaning','Tile/grout scrubbing','Hand washing large laundry loads',
  'Moving heavy furniture','Lifting appliances','Upholstery cleaning',
  'Carpet deep cleaning','Exterior window cleaning','Post-construction cleaning',
  'Renovation cleanup','Paint removal','Mold removal','Pest-related cleaning','Industrial cleaning'
]

// ---------------------------------------------------------------------------
// PRICING ENGINE
// ---------------------------------------------------------------------------
// Estimate time + price from a list of selected task ids.
export function calcEstimate(taskIds = []) {
  const mins = taskIds.reduce((sum, id) => sum + (TASK_MINUTES[id] || 0), 0)
  const hours = mins / 60
  const extraHours = hours > PRICING.baseHours ? Math.ceil(hours - PRICING.baseHours) : 0
  const price = PRICING.base + extraHours * PRICING.hourlyRate
  return {
    mins,
    hours,
    extraHours,
    billedHours: PRICING.baseHours + extraHours,
    price,
    total: price, // no zone fee in v2 — total equals service price
  }
}

// "2h 30m" / "45m" / "3h"
export function formatDuration(mins) {
  const m = Math.max(0, Math.round(mins))
  const h = Math.floor(m / 60)
  const rem = m % 60
  if (h && rem) return `${h}h ${rem}m`
  if (h) return `${h}h`
  return `${rem}m`
}

// ---------------------------------------------------------------------------
// DATE HELPERS — parse 'YYYY-MM-DD' as a LOCAL date (avoids UTC off-by-one)
// ---------------------------------------------------------------------------
export function parseLocalDate(str) {
  if (!str) return null
  const [y, m, d] = String(str).split('-').map(Number)
  if (!y || !m || !d) return null
  return new Date(y, m - 1, d)
}

// Date -> 'YYYY-MM-DD' (local)
export function toYmd(date) {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

// 0 = Sunday ... 6 = Saturday, or -1 if unparseable
export function dayOfWeek(str) {
  const d = parseLocalDate(str)
  return d ? d.getDay() : -1
}
export function isSunday(str) { return dayOfWeek(str) === 0 }
export function isSaturday(str) { return dayOfWeek(str) === 6 }

// DD/MM/YYYY display (CLAUDE.md Ghana format)
export function formatDate(str) {
  const d = parseLocalDate(str)
  if (!d) return str || '—'
  const dd = String(d.getDate()).padStart(2, '0')
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  return `${dd}/${mm}/${d.getFullYear()}`
}

// ---------------------------------------------------------------------------
// BOOKING TOTAL — wraps calcEstimate() and applies the Sunday surcharge.
// The surcharge applies ONLY when the selected date falls on a Sunday.
// ---------------------------------------------------------------------------
export function calcBooking({ taskIds = [], date = '' }) {
  const est = calcEstimate(taskIds)
  const surcharge = isSunday(date) ? SUNDAY_SURCHARGE : 0
  return {
    ...est,            // mins, hours, extraHours, billedHours, price
    surcharge,
    total: est.price + surcharge,
  }
}

export function getStatusLabel(status) {
  const map = {
    pending: 'Pending', accepted: 'Accepted', inprogress: 'In Progress',
    completed: 'Completed', cancelled: 'Cancelled'
  }
  return map[status] || status
}

export function generateRef() {
  return 'CS-' + Math.floor(100000 + Math.random() * 900000)
}

// ---------------------------------------------------------------------------
// MOCK DATA (localStorage seed)
// ---------------------------------------------------------------------------
export const MOCK_ASSISTANTS = [
  { id: 'a1', name: 'Abena Mensah', area: 'East Legon', rating: 4.9, jobs: 142, avatar: 'AM', skills: ['Kitchen','Laundry','Bedrooms'], status: 'available' },
  { id: 'a2', name: 'Esi Owusu', area: 'Osu', rating: 4.8, jobs: 98, avatar: 'EO', skills: ['Living Areas','Bathrooms'], status: 'available' },
  { id: 'a3', name: 'Akosua Tetteh', area: 'Spintex', rating: 5.0, jobs: 201, avatar: 'AT', skills: ['All services'], status: 'busy' },
  { id: 'a4', name: 'Maame Asante', area: 'Labone', rating: 4.7, jobs: 67, avatar: 'MA', skills: ['Kitchen','Ironing'], status: 'available' },
  { id: 'a5', name: 'Adwoa Boateng', area: 'Cantonments', rating: 4.9, jobs: 115, avatar: 'AB', skills: ['Bedrooms','Living Areas'], status: 'available' },
]

export const MOCK_BOOKINGS = [
  {
    id: 'CS-100421',
    tasks: ['Wash dishes','Clean countertops & stovetop','Tidy & declutter','Sweep / vacuum','Clean toilet','Make beds'],
    estMins: 120, estHours: 2, billedHours: 3, price: 349, total: 349,
    area: 'East Legon',
    date: '2026-06-20', timeSlot: 'Morning (from 8am)',
    notes: 'Please bring own cleaning cloths',
    customer: { name: 'James Osei', email: 'james@email.com', phone: '024 123 4567', address: '12 Airport Rd, East Legon' },
    payment: 'online', paymentLabel: 'Pay now — Card or Mobile Money', paymentStatus: 'paid',
    assistant: 'a1', status: 'accepted', createdAt: '2026-06-12'
  },
  {
    id: 'CS-100398',
    tasks: ['Wash a load','Hang / dry clothes','Fold & put away','Iron up to 25 items','Make beds','Clean toilet'],
    estMins: 195, estHours: 3.25, billedHours: 4, price: 449, total: 449,
    area: 'Osu',
    date: '2026-06-18', timeSlot: 'Afternoon (from 1pm)',
    notes: '',
    customer: { name: 'Sarah Ampah', email: 'sarah@email.com', phone: '020 987 6543', address: '5 Oxford St, Osu' },
    payment: 'cash', paymentLabel: 'Cash on arrival', paymentStatus: 'cash_on_arrival',
    assistant: 'a2', status: 'completed', createdAt: '2026-06-08'
  },
  {
    id: 'CS-100412',
    tasks: ['Wash dishes','Clean countertops & stovetop','Sweep & mop floor','Dust surfaces','Tidy & declutter','Mop floors','Clean shower / bath','Interior windows'],
    estMins: 265, estHours: 4.4, billedHours: 5, price: 549, total: 549,
    area: 'Spintex',
    date: '2026-06-22', timeSlot: 'Morning (from 8am)',
    notes: 'Gate code: 1234',
    customer: { name: 'David Nkrumah', email: 'david@email.com', phone: '026 555 0001', address: '8 Spintex Rd, Spintex' },
    payment: 'bank', paymentLabel: 'Bank transfer', paymentStatus: 'pending',
    assistant: null, status: 'pending', createdAt: '2026-06-13'
  }
]

export const MOCK_JOBS = [
  { id: 'CS-100430', area: 'East Legon', estHours: 4, date: '2026-06-21', timeSlot: 'Morning (from 8am)', tasks: ['Wash dishes','Sweep & mop floor','Iron up to 25 items'], pay: 220, distance: '1.2 km' },
  { id: 'CS-100431', area: 'Osu', estHours: 3, date: '2026-06-21', timeSlot: 'Afternoon (from 1pm)', tasks: ['Clean toilet','Make beds','Fold & put away'], pay: 150, distance: '2.5 km' },
  { id: 'CS-100432', area: 'Airport Residential', estHours: 5, date: '2026-06-22', timeSlot: 'Morning (from 8am)', tasks: ['Kitchen','Living Areas'], pay: 280, distance: '0.8 km' },
]
