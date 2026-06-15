// Destination data for Travel Meadow.
//
// Each destination has descriptive content for its page, plus a set of
// "tags" used to match it against the answers a visitor gives in the
// Trip Planner on the homepage. Matching is intentionally simple — it just
// counts how many of the visitor's answers overlap with a destination's
// tags — so it's easy to understand, tweak, or replace later (e.g. with an
// AI-powered recommendation step).

export type AnswerKey =
  | "region"
  | "party"
  | "interest"
  | "weather"
  | "duration"
  | "travelTime"
  | "style"
  | "budget";

export type MetaIcon = "sun" | "plane" | "calendar" | "wallet";

export type Destination = {
  slug: string;
  name: string;
  country: string;
  emoji: string;
  tagline: string;
  why: string;
  bannerColor: string;
  meta: { icon: MetaIcon; label: string }[];
  highlights: string[];
  tips: string[];
  // IATA code for the nearest major airport, used as the default
  // "destination" for the flight search on this destination's page.
  iata: string;
  city: string;
  lat: number;
  lng: number;
  tags: Record<AnswerKey, string[]>;
};

export const DESTINATIONS: Destination[] = [
  {
    slug: "santorini",
    name: "Santorini",
    country: "Greece",
    emoji: "🏝",
    tagline: "Iconic sunsets, whitewashed villages and volcanic beaches.",
    why:
      "A classic for couples: Santorini delivers world-famous sunsets over the caldera, intimate cave hotels carved into the cliffside, and black volcanic beaches that feel genuinely dramatic. July and August see reliably hot, sunny weather with almost no rain.",
    bannerColor: "#1a6b4a",
    meta: [
      { icon: "sun", label: "Hot & sunny Jul–Aug" },
      { icon: "plane", label: "~3.5h from London" },
      { icon: "calendar", label: "Best: June–September" },
      { icon: "wallet", label: "Mid-range to premium" },
    ],
    highlights: [
      "Oia sunset viewpoint",
      "Red & black volcanic beaches",
      "Fira & Oia villages",
      "Volcanic wine tasting",
    ],
    tips: [
      "Book cave hotels in Oia at least 6 months ahead for summer stays — they sell out fast.",
      "Catch the sunset from Imerovigli rather than Oia for the same view with a fraction of the crowd.",
      "Hire a quad bike to reach quieter beaches on the south of the island.",
      "Ferry connections to Mykonos and Crete are straightforward if you want to add a second stop.",
    ],
    iata: "JTR",
    city: "Santorini",
    lat: 36.3932,
    lng: 25.4615,
    tags: {
      region: ["Europe"],
      party: ["Couple", "Group of friends"],
      interest: [
        "Beach & coast",
        "Relaxation & wellness",
        "Food & drink",
        "History & heritage",
      ],
      weather: ["Hot and sunny", "Warm with a breeze"],
      duration: ["One week", "10–12 days"],
      travelTime: ["Short-haul (up to 3 hours)", "Medium-haul (3–6 hours)"],
      style: ["One base, total relaxation", "One base with day trips"],
      budget: ["Mid-range (£1,000–£2,500)", "Premium (£2,500–£5,000)"],
    },
  },
  {
    slug: "maldives",
    name: "Maldives",
    country: "Republic of Maldives",
    emoji: "🌊",
    tagline: "Over-water bungalows, crystal lagoons, and total seclusion.",
    why:
      "For a couple wanting pure relaxation in hot, sunny weather, the Maldives is hard to beat. Private over-water villas, house-reef snorkelling, and almost zero outside stimulation make it one of the world's great \"switch off\" destinations.",
    bannerColor: "#0a5c7a",
    meta: [
      { icon: "sun", label: "Hot & sunny year-round" },
      { icon: "plane", label: "~10h from London" },
      { icon: "calendar", label: "Best: Nov–April" },
      { icon: "wallet", label: "Premium to luxury" },
    ],
    highlights: [
      "House reef snorkelling",
      "Over-water villas",
      "Crystal-clear lagoons",
      "Bioluminescent beaches",
    ],
    tips: [
      "November to April is dry season — avoid May to October when monsoon rains arrive.",
      "Budget for the seaplane transfer from Malé — it can add £200–400 per person but is spectacular.",
      "All-inclusive resorts are the norm; factor this into your per-person budget.",
      "Look for deals in the shoulder months of November and April.",
    ],
    iata: "MLE",
    city: "Malé",
    lat: 4.1755,
    lng: 73.5093,
    tags: {
      region: ["Indian Ocean islands"],
      party: ["Couple"],
      interest: ["Beach & coast", "Relaxation & wellness"],
      weather: ["Hot and sunny"],
      duration: ["One week", "10–12 days", "Two weeks"],
      travelTime: ["Long-haul (6–12 hours)"],
      style: ["One base, total relaxation"],
      budget: ["Premium (£2,500–£5,000)", "Luxury (£5,000+)"],
    },
  },
  {
    slug: "amalfi-coast",
    name: "Amalfi Coast",
    country: "Italy",
    emoji: "🍋",
    tagline: "Dramatic cliffs, lemon groves, and some of Italy's best food.",
    why:
      "The Amalfi Coast combines everything: vivid coastal scenery, excellent food, the culture of Positano and Ravello, and reliable Mediterranean heat. It works brilliantly as a single base or a slow journey between villages.",
    bannerColor: "#7a4a0a",
    meta: [
      { icon: "sun", label: "Hot & dry Jul–Aug" },
      { icon: "plane", label: "~2.5h from London" },
      { icon: "calendar", label: "Best: May–October" },
      { icon: "wallet", label: "Mid-range to premium" },
    ],
    highlights: [
      "Path of the Gods hike",
      "Positano & Ravello",
      "Fresh seafood & pasta",
      "Boat trips to Capri",
    ],
    tips: [
      "Stay in Positano or Praiano to avoid the tour-bus crowds in peak season.",
      "Hire a private boat for a day — it's cheaper than you'd expect and transforms the coast.",
      "Book restaurants weeks in advance in July and August.",
      "Come in May or late September for the same scenery with noticeably fewer visitors.",
    ],
    iata: "NAP",
    city: "Naples",
    lat: 40.6401,
    lng: 14.6033,
    tags: {
      region: ["Europe"],
      party: [
        "Couple",
        "Family with teens",
        "Group of friends",
        "Multi-generational family",
      ],
      interest: [
        "City sights & culture",
        "Natural beauty",
        "Beach & coast",
        "Food & drink",
        "History & heritage",
      ],
      weather: ["Hot and sunny", "Mild and dry"],
      duration: ["Long weekend (3–4 days)", "One week", "10–12 days"],
      travelTime: ["Short-haul (up to 3 hours)"],
      style: ["One base with day trips", "Two or three stops"],
      budget: ["Mid-range (£1,000–£2,500)", "Premium (£2,500–£5,000)"],
    },
  },
  {
    slug: "bali",
    name: "Bali",
    country: "Indonesia",
    emoji: "🌺",
    tagline: "Jungle temples, terraced rice fields, and world-class spas.",
    why:
      "Bali blends beach, culture, food, and wellness in a way few destinations match. From Canggu's surf breaks to Ubud's rice terraces and Seminyak's sunset bars, there's enough variety to fill two weeks without effort.",
    bannerColor: "#5a2a7a",
    meta: [
      { icon: "sun", label: "Warm year-round" },
      { icon: "plane", label: "~14h from London" },
      { icon: "calendar", label: "Best: May–September" },
      { icon: "wallet", label: "Budget to mid-range" },
    ],
    highlights: [
      "Tanah Lot temple",
      "Tegalalang rice terraces",
      "Ubud wellness retreats",
      "Canggu surf breaks",
    ],
    tips: [
      "Dry season runs May–September — the wet season (Nov–March) brings heavy afternoon rain.",
      "Hire a driver for £25–35 a day to see the whole island comfortably.",
      "Split your time between Ubud (culture, rice terraces) and the south coast (beach, surf).",
      "Respect temple dress codes — a sarong is required and usually provided at the entrance.",
    ],
    iata: "DPS",
    city: "Denpasar",
    lat: -8.3405,
    lng: 115.0920,
    tags: {
      region: ["South & Southeast Asia"],
      party: ["Solo adventurer", "Couple", "Group of friends"],
      interest: [
        "City sights & culture",
        "Natural beauty",
        "Beach & coast",
        "Relaxation & wellness",
        "Adventure & activities",
        "Food & drink",
      ],
      weather: [
        "Hot and sunny",
        "Warm with a breeze",
        "Weather doesn't matter",
      ],
      duration: ["10–12 days", "Two weeks", "Three weeks or more"],
      travelTime: ["Long-haul (6–12 hours)", "Anywhere"],
      style: ["Two or three stops", "Full multi-stop tour"],
      budget: [
        "Budget (under £1,000)",
        "Mid-range (£1,000–£2,500)",
        "Flexible — best value",
      ],
    },
  },
  {
    slug: "scottish-highlands",
    name: "Scottish Highlands",
    country: "Scotland, UK",
    emoji: "🏔",
    tagline: "Misty glens, single-track roads, and dramatic peaks — no flight required.",
    why:
      "If you'd rather skip the airport altogether, the Highlands offer some of Europe's most dramatic scenery within a day's drive or train ride. Expect wildlife, history, and weather that genuinely doesn't matter — it's part of the character.",
    bannerColor: "#3a5a4a",
    meta: [
      { icon: "sun", label: "Mild, changeable weather" },
      { icon: "plane", label: "No flight needed" },
      { icon: "calendar", label: "Best: April–September" },
      { icon: "wallet", label: "Budget to mid-range" },
    ],
    highlights: [
      "Loch Ness & Glen Coe",
      "Isle of Skye road trip",
      "Castle & whisky tours",
      "Red deer & golden eagles",
    ],
    tips: [
      "The North Coast 500 route is a great way to structure a multi-stop trip by car.",
      "Midges (small biting flies) are worst June–August at dusk — pack repellent.",
      "Book accommodation early for the Isle of Skye in summer; options are limited.",
      "Train from London to Inverness is a scenic option if you'd rather not drive the whole way.",
    ],
    iata: "INV",
    city: "Inverness",
    lat: 57.4778,
    lng: -4.2247,
    tags: {
      region: ["UK & Ireland", "Open to suggestions"],
      party: [
        "Solo adventurer",
        "Couple",
        "Family with young children",
        "Family with teens",
        "Group of friends",
        "Multi-generational family",
      ],
      interest: [
        "Natural beauty",
        "Adventure & activities",
        "Wildlife & safari",
        "History & heritage",
      ],
      weather: [
        "Mild and dry",
        "Snow and winter magic",
        "Weather doesn't matter",
      ],
      duration: ["Long weekend (3–4 days)", "One week"],
      travelTime: ["No flights — UK only"],
      style: [
        "One base with day trips",
        "Two or three stops",
        "Full multi-stop tour",
      ],
      budget: [
        "Budget (under £1,000)",
        "Mid-range (£1,000–£2,500)",
        "Flexible — best value",
      ],
    },
  },
  {
    slug: "costa-rica",
    name: "Costa Rica",
    country: "Costa Rica",
    emoji: "🦜",
    tagline: "Rainforest, volcanoes, and wildlife around every corner.",
    why:
      "For travellers who want adventure and wildlife alongside warm weather, Costa Rica delivers — sloths and toucans in the canopy, zip-lining over volcanoes, and beaches on both the Pacific and Caribbean coasts, all within a fairly compact, easy-to-navigate country.",
    bannerColor: "#2a6a3a",
    meta: [
      { icon: "sun", label: "Hot, varies by coast" },
      { icon: "plane", label: "~11h from London" },
      { icon: "calendar", label: "Best: Dec–April" },
      { icon: "wallet", label: "Mid-range to premium" },
    ],
    highlights: [
      "Arenal Volcano & hot springs",
      "Monteverde cloud forest",
      "Sloth & toucan spotting",
      "Pacific coast surf towns",
    ],
    tips: [
      "December to April (dry season) is the most popular and reliable time to visit.",
      "Domestic flights or shuttle buses make it easy to combine rainforest and coast.",
      "Book wildlife lodges in Monteverde and Tortuguero well in advance — they're small.",
      "Spanish basics go a long way outside the main tourist towns.",
    ],
    iata: "SJO",
    city: "San José",
    lat: 9.9281,
    lng: -84.0907,
    tags: {
      region: ["Caribbean & Mexico"],
      party: [
        "Solo adventurer",
        "Couple",
        "Family with teens",
        "Group of friends",
      ],
      interest: [
        "Wildlife & safari",
        "Adventure & activities",
        "Natural beauty",
        "Beach & coast",
      ],
      weather: ["Hot and sunny", "Warm with a breeze"],
      duration: ["10–12 days", "Two weeks"],
      travelTime: ["Long-haul (6–12 hours)"],
      style: ["Full multi-stop tour", "Two or three stops"],
      budget: ["Mid-range (£1,000–£2,500)", "Premium (£2,500–£5,000)"],
    },
  },
];

export function getDestinationBySlug(slug: string): Destination | undefined {
  return DESTINATIONS.find((d) => d.slug === slug);
}

export type MatchResult = {
  destination: Destination;
  score: number;
  matchedOn: string[];
};

// "Flexible" answers (open to anything) give every destination a small
// boost rather than requiring an exact tag match.
const FLEXIBLE_ANSWERS = new Set([
  "Open to suggestions",
  "Weather doesn't matter",
  "Anywhere",
  "Flexible — best value",
]);

export function matchDestinations(
  answers: Partial<Record<AnswerKey, string[]>>
): MatchResult[] {
  return DESTINATIONS.map((destination) => {
    let score = 0;
    const matchedOn: string[] = [];

    for (const [key, values] of Object.entries(answers) as [
      AnswerKey,
      string[]
    ][]) {
      if (!values || values.length === 0) continue;
      const tagValues = destination.tags[key];
      if (!tagValues) continue;

      for (const value of values) {
        if (FLEXIBLE_ANSWERS.has(value)) {
          score += 0.5;
          continue;
        }
        if (tagValues.includes(value)) {
          score += 1;
          matchedOn.push(value);
        }
      }
    }

    return { destination, score, matchedOn };
  }).sort((a, b) => b.score - a.score);
}
