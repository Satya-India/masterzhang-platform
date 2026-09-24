export type Locale = 'en' | 'zh';

export const LOCALES: { code: Locale; label: string; htmlLang: string }[] = [
  { code: 'en', label: 'EN', htmlLang: 'en-CA' },
  { code: 'zh', label: '中文', htmlLang: 'zh-CN' },
];

export const SITE = {
  name: 'Nexus Care',
  nameZh: 'Nexus Care · 综合物业服务',
  phone: '+1 (416) 846-3253',
  phoneHref: '+14168463253',
  email: 'hello@nexuscare.ca',
  rfpEmail: 'rfp@nexuscare.ca',
  address: {
    /** Street address — leave empty until a physical office address is confirmed. */
    street: '',
    city: 'Markham',
    region: 'ON',
    postal: 'L3S 1K8',
    country: 'CA',
  },
  hours: 'Mon–Sat 07:00–21:00 · Sun 08:00–18:00',
} as const;


/** Prefix a path with the locale segment (EN is served from root). */
export function localePath(path: string, locale: Locale): string {
  if (locale === 'en') return path;
  const clean = path === '/' ? '' : path;
  return `/zh${clean}`;
}

export const en = {
  nav: {
    services: 'Services',
    areas: 'Service Areas',
    reviews: 'Reviews',
    estimate: 'Instant Estimate',
    commercial: 'Commercial RFP',
    phone: 'Call dispatch',
  },
  hero: {
    eyebrow: 'Markham & York Region · Licensed & Insured · Dispatched 7 Days a Week',
    titleA: 'Moving, Cleaning & Property Care —',
    titleB: 'Without the Chaos.',
    sub: 'Stop calling 4 different contractors. From careful furniture transport and move-out deep cleans to prompt junk haul-away and winter snow clearing — one trusted, five-star crew handles it all with upfront fixed pricing and live GPS tracking.',
    ctaPrimary: 'Get Instant Ballpark ↓',
    ctaSecondary: 'Call Dispatch',
    quickCard: {
      liveStatus: 'Crews Active in York Region Today',
      title: 'Instant Rates & Inclusions',
      tabs: {
        moving: 'Moving',
        cleanup: 'Cleaning',
        snow: 'Snow',
        yard: 'Yard Care',
      },
      movingPrice: 'From $395 CAD',
      movingFeatures: [
        'Dedicated 16–26ft truck + 2–3 uniformed movers',
        'Free floor runners, door pads & heavy blankets',
        'Condo elevator booking slots & detached homes',
        'Real-time GPS tracking sent straight to your phone',
      ],
      cleanupPrice: 'From $280 CAD',
      cleanupFeatures: [
        '100% landlord & tenant inspection-ready guarantee',
        'Deep bathroom descaling & kitchen grease removal',
        'Eco-friendly hospital-grade sanitization products',
        'Combined junk removal available in same booking',
      ],
      snowPrice: 'From $95 / visit · $450 / season',
      snowFeatures: [
        '24-hr trigger response after every 5cm snowfall',
        'Driveway, front walkway, steps & porch shoveled',
        'Pet-friendly & concrete-safe eco calcium salt',
        'Zero ice build-up with continuous storm monitoring',
      ],
      yardPrice: 'From $190 CAD',
      yardFeatures: [
        'Spring power-rake, dethatching & core aeration',
        'Bi-weekly lawn mowing, edging & weed trimming',
        'Fall leaf cleanup & curbside yard waste bagging',
        'Eavestrough gutter clearing before winter freeze',
      ],
      actionBtn: 'Customize This Service ↓',
      note: '⏱️ 60-Second Ballpark · Transparent upfront pricing',
    },
    stats: [
      { v: '2,400+', l: 'Jobs completed' },
      { v: '100%', l: 'On-time completion' },
      { v: '< 90 min', l: 'Emergency dispatch' },
    ],
  },

  badges: {
    cgl: '$5M Commercial General Liability',
    cvor: 'CVOR Certified Fleet',
    wsib: 'WSIB Cleared Crews',
    ontime: '100% On-Time Guarantee',
  },
  services: {
    eyebrow: 'Four verticals. One accountable crew.',
    title: 'Full-cycle property care',
    sub: 'From the day you get keys to the day you hand them over — and every season in between.',
    items: [
      {
        id: 'moving',
        title: 'Moving Help',
        desc: 'Full-service local moves and labour-only help. We wrap, carry, load, drive and place everything where you want it. Apartments, condos, houses and offices.',
        price: 'From $395',
      },
      {
        id: 'cleanup',
        title: 'Move-In / Move-Out Clean & Junk Removal',
        desc: 'One booking covers the full turnover — deep clean every room, haul away the junk, and leave the unit ready for inspection or new keys.',
        price: 'From $350',
      },
      {
        id: 'snow',
        title: 'Snow Clearing & Salting',
        desc: '24-hour trigger service after every snowfall. Driveways, walkways, and commercial lots cleared and salted before you need them.',
        price: 'From $420/season',
      },
      {
        id: 'yard',
        title: 'Yard & Garden Care',
        desc: 'Spring clean-ups, fall leaf removal, lawn mowing, hedge and bed trimming. Subscription plans for year-round property maintenance.',
        price: 'From $250',
      },
    ],
  },
  estimator: {
    eyebrow: '60-second ballpark',
    title: 'Instant Estimator',
    sub: 'Three steps. No email walls — the price range appears before we ask for contact details.',
    stepOf: 'Step {n} of 3',
    chooseService: 'What do you need?',
    chooseVolume: 'Scale of the job',
    contact: 'Where do we send the firm quote?',
    services: {
      moving: 'Moving Help',
      cleanup: 'Clean & Junk',
      snow: 'Snow Clearing',
      yard: 'Yard & Garden',
    },
    movingOptions: [
      { id: '1', label: '1 bedroom / studio' },
      { id: '2', label: '2 bedrooms' },
      { id: '3', label: '3 bedrooms' },
      { id: '4', label: '4+ bedrooms / office' },
    ],
    cleanupOptions: [
      { id: '1', label: '1 bedroom / studio' },
      { id: '2', label: '2 bedrooms' },
      { id: '3', label: '3 bedrooms' },
      { id: '4', label: '4+ bedrooms' },
    ],
    snowOptions: [
      { id: 'small', label: 'Small driveway (1–2 cars)' },
      { id: 'medium', label: 'Double driveway + walkway' },
      { id: 'large', label: 'Large lot / T-intersection' },
      { id: 'commercial', label: 'Commercial plaza / condo' },
    ],
    yardOptions: [
      { id: 'small', label: 'Small yard (under 4,000 sq ft)' },
      { id: 'medium', label: 'Medium yard (4,000–8,000 sq ft)' },
      { id: 'large', label: 'Large yard / estate' },
      { id: 'plan', label: 'Annual maintenance plan' },
    ],
    volumeLabel: 'Select size',
    postalLabel: 'Postal code',
    postalHint: 'York Region FSAs: L3P, L3R, L4B, L6A…',
    nameLabel: 'Full name',
    emailLabel: 'Email',
    phoneLabel: 'Phone',
    notesLabel: 'Anything we should know? (optional)',
    next: 'Continue',
    back: 'Back',
    submit: 'Request firm quote',
    submitting: 'Sending…',
    rangeLabel: 'Typical range for this job',
    firmQuote: 'A dispatcher confirms your firm, fixed price within 2 business hours.',
    successTitle: 'Request received.',
    successBody: 'Your quote request is with our dispatch team. Expect a call or email within 2 business hours.',
    another: 'Start another estimate',
    disclaimer: 'Ballpark only — final pricing confirmed on-site or by video walk-through.',
    errors: {
      required: 'This field is required',
      email: 'Enter a valid email address',
      phone: 'Enter a valid phone number',
      postal: 'Use format L6A 1A1',
      outside: 'Outside York Region — we may still serve you; submit and we will confirm.',
    },
    step2Title: 'Customize Your Service & Add-ons',
    step2Sub: 'Tailor options for your property — pricing updates live',
    step3Title: 'Preferred Date & Contact Details',
    step3Sub: 'Where should our dispatch team send your locked quote and confirmation?',
    dateLabel: 'Preferred service date',
    dateHint: 'Select target date',
    urgencyLabel: 'Timeline / Urgency',
    urgencyOptions: {
      flexible: 'Flexible (Standard scheduling)',
      rush: 'End-of-month / Weekend rush',
      urgent: 'Urgent (Within 24–48 hours)',
    },
    destPostalLabel: 'Destination postal code (Moving to)',
    destPostalHint: 'e.g. L4B 3M2 (GTA / York Region)',
    // Moving details
    moveTypeTitle: 'Service format',
    moveTypes: {
      full: 'Full Service Move (Dedicated Truck + Professional Crew)',
      labour: 'Labour Only (Loading / Unloading your rental truck or Pod) [-$120]',
    },
    accessTitle: 'Property access & building type',
    accessTypes: {
      ground: 'Ground level / Driveway access (+$0)',
      elevator: 'Condo / Apartment with Elevator booking (+$60)',
      stairs: '2–3 Storey Townhouse / Multi-flight stairs (+$50)',
    },
    movingAddonsTitle: 'Specialty items & protection (optional)',
    movingAddons: {
      piano: 'Upright Piano / Heavy Safe / Gym Rig (+$180)',
      disassembly: 'Bed & Furniture Disassembly / Reassembly (+$75)',
      packing: 'Mattress Bag & Wardrobe Box Protection (+$45)',
    },
    // Cleanup details
    bathroomsTitle: 'Number of bathrooms',
    bathOptions: [
      { id: '1', label: '1 Bathroom (+$0)' },
      { id: '2', label: '2 Bathrooms (+$60)' },
      { id: '3', label: '3 Bathrooms (+$120)' },
      { id: '4', label: '4+ Bathrooms (+$180)' },
    ],
    conditionTitle: 'Clean intensity & condition',
    conditionTypes: {
      standard: 'Standard Turnover Inspection Clean (+$0)',
      heavy: 'Post-Renovation Drywall Dust / Deep Grime (+$95)',
    },
    cleaningAddonsTitle: 'Kitchen & glass deep-clean add-ons (optional)',
    cleaningAddons: {
      oven: 'Inside Oven Deep Degrease & Scrub (+$50)',
      fridge: 'Inside Refrigerator Deep Sterilize (+$45)',
      windows: 'Interior Window Glass & Sills (+$65)',
      carpet: 'Carpet Steam Extraction Shampoo (+$85)',
    },
    junkTitle: 'Junk haul-away volume',
    junkOptions: [
      { id: 'none', label: 'No junk removal — cleaning only (+$0)' },
      { id: 'light', label: 'Light (1–2 items: mattress / sofa) (+$120)' },
      { id: 'medium', label: 'Half trailer / Single room clear-out (+$260)' },
      { id: 'heavy', label: 'Full estate / Garage clear-out (+$480)' },
    ],
    // Snow details
    snowTypeTitle: 'Coverage type',
    snowTypes: {
      seasonal: 'Unlimited Season Pass (Nov 15 – Apr 1, >5cm trigger)',
      per_visit: 'Single Storm Emergency Clearing',
    },
    snowAddonsTitle: 'Canadian winter safety add-ons (optional)',
    snowAddons: {
      walkway: 'Hand-shovel front walkway, porch & steps (+$120 season / +$35 visit)',
      ecoSalt: 'Pet-friendly & concrete-safe eco calcium chloride (+$80 season / +$25 visit)',
      iceScrape: 'Heavy ice scrape & hard-pack ice breaker (+$45)',
    },
    // Yard details
    yardPackagesTitle: 'Trending Ontario seasonal services (select all that apply)',
    yardPackages: {
      aeration: 'Spring Dethatching, Power Rake & Core Aeration (+$140)',
      mow: 'Bi-Weekly Lawn Mowing & Edging Plan (May–Oct) (+$45/visit)',
      leaves: 'Fall Leaf Cleanup & Curbside Bagging (+$160)',
      hedges: 'Cedar Hedge & Shrub Trimming (+$120)',
      gutters: 'Eavestrough / Gutter Debris Flush (+$150)',
    },
    trackRequestBtn: 'Track Your Request Live →',
    trackHint: 'You can check dispatch status and track your crew in real-time.',
    selectService: 'Select a service to continue',
    selectVolume: 'Select a size to continue',
  },

  gallery: {
    eyebrow: 'Proof of work',
    title: 'Before / After',
    sub: 'Drag the handle — real transformations from our routes across Markham and York Region.',
    cases: [
      { title: 'Estate clear-out, Unionville', before: 'Before — 2 trailer loads', after: 'After — sweep clean' },
      { title: 'Post-construction clean, Markham', before: 'Before — drywall dust', after: 'After — handover ready' },
      { title: 'Commercial lot, Vaughan', before: 'Before — 14 cm snowfall', after: 'After — 5:30 AM, salted' },
    ],
  },
  reviews: {
    eyebrow: '4.9 / 5 across 300+ reviews',
    title: 'Neighbours & property managers',
    items: [
      {
        quote: 'Crew arrived at 8:00 sharp, wrapped everything, and the turnover clean passed inspection on the first visit. They are on our vendor list permanently.',
        name: 'D. Whitfield',
        role: 'Property Manager, Thornhill',
      },
      {
        quote: 'Basement clear-out gone by lunch — two trailer loads, no damage to the walls, and they swept the garage too. Fair price, zero drama.',
        name: 'M. Chen',
        role: 'Homeowner, Markham',
      },
      {
        quote: 'We used them for an office relocation over a weekend. Monday morning, 40 desks were live. That is all you need to know.',
        name: 'S. Okafor',
        role: 'Operations Lead, Vaughan',
      },
    ],
  },
  dualCta: {
    residentialTitle: 'Homeowners',
    residentialBody: 'Fixed-price moving, cleaning and seasonal plans. Get a ballpark in 60 seconds, a firm quote within 2 business hours.',
    residentialCta: 'Instant Residential Estimate',
    commercialTitle: 'Property managers & businesses',
    commercialBody: 'Vendor accounts with COI on file, WSIB clearance, priority storm response and consolidated monthly invoicing for your portfolio.',
    commercialCta: 'Start a Commercial RFP',
    commercialNote: 'Portfolio snow & grounds contracts welcome.',
  },
  areas: {
    eyebrow: 'Dispatch hub: Markham',
    title: 'Service areas across York Region',
    sub: 'Primary coverage with sub-90-minute emergency response. We also serve bordering neighbourhoods in North York and Scarborough.',
    stats: { drive: 'min avg. dispatch', jobs: 'jobs completed', fsa: 'postal FSAs covered' },
    viewPage: 'View city page',
  },
  footer: {
    tagline: 'Moving, cleaning & property maintenance for Markham and York Region. 用专业服务，让生活更轻松。',
    servicesTitle: 'Services',
    areasTitle: 'Service Areas',
    contactTitle: 'Dispatch',
    hoursLabel: 'Hours',
    rights: 'All rights reserved.',
    licensed: 'Fully licensed & insured · CVOR Certified Fleet',
  },
} as const;

export type Dict = typeof en;

import { zh } from './dict.zh';

export const dict: Record<Locale, Dict> = { en, zh };

/** Look up a dictionary for a locale, falling back to English. */
export function getDict(locale: string | undefined): Dict {
  return locale === 'zh' ? zh : en;
}
