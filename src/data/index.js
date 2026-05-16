export const ZONES = {
  zone1: {
    label: 'Zone 1',
    fee: 20,
    areas: [
      'East Legon','Airport Residential','Cantonments','Osu','Labone',
      'Ridge','Dzorwulu','Roman Ridge','North Ridge','Abelemkpe',
      'Adjiringanor','Shiashie'
    ]
  },
  zone2: {
    label: 'Zone 2',
    fee: 30,
    areas: [
      'Madina','Adenta','Spintex','Teshie','Achimota','Dansoman',
      'Legon','Haatso','West Legon','Tesano','Taifa','North Kaneshie',
      'South Kaneshie','Bortianor'
    ]
  }
}

export const PRICING = {
  halfDay: { label: 'Half Day', hours: 3.5, price: 235 },
  fullDay: { label: 'Full Day', hours: 7, price: 465 }
}

export const TASK_GROUPS = [
  {
    id: 'light_cleaning',
    label: 'Light Home Cleaning',
    tasks: [
      'Sweeping floors','Mopping floors','Dusting surfaces',
      'Wiping countertops','Bathroom refresh','Living room tidying','Bedroom tidying'
    ]
  },
  {
    id: 'kitchen',
    label: 'Kitchen Support',
    tasks: ['Dishwashing','Kitchen surface cleaning','Kitchen organisation','General upkeep']
  },
  {
    id: 'laundry',
    label: 'Laundry & Ironing',
    tasks: ['Machine washing','Hanging/drying clothes','Folding clothes','Ironing']
  },
  {
    id: 'organisation',
    label: 'Home Organisation',
    tasks: ['Bed making','Changing linens','General tidying','Room organisation']
  }
]

export const EXCLUDED_TASKS = [
  'Deep cleaning','Heavy grease removal','Oven interior cleaning',
  'Fridge deep cleaning','Tile/grout scrubbing','Hand washing large laundry loads',
  'Moving heavy furniture','Lifting appliances','Upholstery cleaning',
  'Carpet deep cleaning','Exterior window cleaning','Post-construction cleaning',
  'Renovation cleanup','Paint removal','Mold removal','Pest-related cleaning','Industrial cleaning'
]

export const MOCK_ASSISTANTS = [
  { id: 'a1', name: 'Abena Mensah', area: 'East Legon', zone: 'zone1', rating: 4.9, jobs: 142, avatar: 'AM', skills: ['Light Home Cleaning','Laundry & Ironing','Kitchen Support'], status: 'available' },
  { id: 'a2', name: 'Esi Owusu', area: 'Osu', zone: 'zone1', rating: 4.8, jobs: 98, avatar: 'EO', skills: ['Home Organisation','Light Home Cleaning'], status: 'available' },
  { id: 'a3', name: 'Akosua Tetteh', area: 'Spintex', zone: 'zone2', rating: 5.0, jobs: 201, avatar: 'AT', skills: ['All services'], status: 'busy' },
  { id: 'a4', name: 'Maame Asante', area: 'Adenta', zone: 'zone2', rating: 4.7, jobs: 67, avatar: 'MA', skills: ['Kitchen Support','Laundry & Ironing'], status: 'available' },
  { id: 'a5', name: 'Adwoa Boateng', area: 'Cantonments', zone: 'zone1', rating: 4.9, jobs: 115, avatar: 'AB', skills: ['Light Home Cleaning','Home Organisation'], status: 'available' },
]

export const MOCK_BOOKINGS = [
  {
    id: 'CS-100421',
    type: 'fullDay',
    days: 1,
    zone: 'zone1',
    area: 'East Legon',
    date: '2026-05-20',
    timeSlot: 'Full day',
    tasks: ['Sweeping floors','Mopping floors','Dishwashing','Bed making'],
    notes: 'Please bring own cleaning cloths',
    customer: { name: 'James Osei', email: 'james@email.com', phone: '024 123 4567', address: '12 Airport Rd, East Legon' },
    assistant: 'a1',
    status: 'accepted',
    subtotal: 465, discount: 0, serviceFee: 20, total: 485,
    createdAt: '2026-05-15'
  },
  {
    id: 'CS-100398',
    type: 'halfDay',
    days: 2,
    zone: 'zone1',
    area: 'Osu',
    date: '2026-05-18',
    timeSlot: 'Morning',
    tasks: ['Sweeping floors','Bathroom refresh','Ironing'],
    notes: '',
    customer: { name: 'Sarah Ampah', email: 'sarah@email.com', phone: '020 987 6543', address: '5 Oxford St, Osu' },
    assistant: 'a2',
    status: 'completed',
    subtotal: 470, discount: 0, serviceFee: 40, total: 510,
    createdAt: '2026-05-10'
  },
  {
    id: 'CS-100412',
    type: 'fullDay',
    days: 4,
    zone: 'zone2',
    area: 'Spintex',
    date: '2026-05-22',
    timeSlot: 'Full day',
    tasks: ['Sweeping floors','Mopping floors','Kitchen surface cleaning','Folding clothes'],
    notes: 'Gate code: 1234',
    customer: { name: 'David Nkrumah', email: 'david@email.com', phone: '026 555 0001', address: '8 Spintex Rd, Spintex' },
    assistant: null,
    status: 'pending',
    subtotal: 1674, discount: 186, serviceFee: 120, total: 1794,
    createdAt: '2026-05-16'
  }
]

export const MOCK_JOBS = [
  {
    id: 'CS-100430',
    area: 'East Legon',
    zone: 'zone1',
    type: 'Full Day',
    date: '2026-05-21',
    timeSlot: 'Full day',
    tasks: ['Sweeping floors','Mopping floors','Dishwashing','Ironing'],
    pay: 220,
    distance: '1.2 km'
  },
  {
    id: 'CS-100431',
    area: 'Osu',
    zone: 'zone1',
    type: 'Half Day',
    date: '2026-05-21',
    timeSlot: 'Morning',
    tasks: ['Bathroom refresh','Bed making','Folding clothes'],
    pay: 110,
    distance: '2.5 km'
  },
  {
    id: 'CS-100432',
    area: 'Airport Residential',
    zone: 'zone1',
    type: 'Full Day',
    date: '2026-05-22',
    timeSlot: 'Full day',
    tasks: ['Light Home Cleaning','Kitchen Support'],
    pay: 230,
    distance: '0.8 km'
  }
]

export function calcPricing({ type, days, zone }) {
  const base = PRICING[type]?.price || 0
  const zoneFee = ZONES[zone]?.fee || 0
  const subtotal = base * days
  const discount = days > 3 ? Math.round(subtotal * 0.1) : 0
  const discountedSubtotal = subtotal - discount
  const serviceFee = zoneFee * days
  const total = discountedSubtotal + serviceFee
  return { subtotal, discount, discountedSubtotal, serviceFee, total }
}

export function getZoneForArea(area) {
  for (const [key, z] of Object.entries(ZONES)) {
    if (z.areas.includes(area)) return key
  }
  return null
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
