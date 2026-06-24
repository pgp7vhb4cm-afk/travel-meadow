// Server-side Anthropic API client for AI-powered itinerary generation
// and destination discovery.
//
// IMPORTANT: This file should only ever be imported from server code
// (e.g. app/api/.../route.ts). It reads process.env.ANTHROPIC_API_KEY,
// which must never be exposed to the browser.
//
// Docs: https://docs.claude.com/en/docs/agents-and-tools/tool-use/web-search-tool

import type { Destination } from "./destinations";

const ANTHROPIC_API_URL = "https://api.anthropic.com/v1/messages";
const MODEL = "claude-sonnet-4-6";

export function hasAnthropicKey(): boolean {
  return Boolean(process.env.ANTHROPIC_API_KEY);
}

export type ItineraryDay = {
  day: number;
  title: string;
  description: string;
};

export type AccommodationOption = {
  name: string;
  type: string;
  whyGoodFit: string;
  priceIndicator: string;
};

export type ItineraryStop = {
  stopNumber: number;
  area: string;
  nights: number;
  whyStay: string;
  accommodationOptions: AccommodationOption[];
};

export type ItinerarySource = {
  title: string;
  url: string;
};

export type AiItinerary = {
  destinationSlug: string;
  summary: string;
  bestTimeToVisit: string;
  stops: ItineraryStop[];
  days: ItineraryDay[];
  sources: ItinerarySource[];
};

export type PlannerAnswers = Partial<Record<string, string[]>>;

function buildPrompt(destination: Destination, answers: PlannerAnswers): string {
  const answerLines = Object.entries(answers)
    .filter(([, values]) => values && values.length > 0)
    .map(([key, values]) => `- ${key}: ${(values as string[]).join(", ")}`)
    .join("\n");

  const styleAnswer = answers.style?.[0];

  return `You are a senior travel consultant, in the style of a Trailfinders advisor, building a tailored itinerary for a client.

Destination: ${destination.name}, ${destination.country}

Client's stated preferences from our trip planner:
${answerLines || "- No specific preferences given, suggest a well-rounded trip"}

Use web search to check current, reputable travel sources (e.g. established travel publications, tourism boards, well-known travel sites) for what's genuinely recommended right now for this destination — don't rely solely on prior knowledge, since opening times, top-rated tours, "best areas to stay", and specific hotel/accommodation recommendations can change.

Build a realistic itinerary that:
1. Matches the length implied by their "duration" answer (if "Long weekend" assume 4 days, "One week" assume 7 days, "10-12 days" assume 11 days, "Two weeks" assume 14 days, "Three weeks or more" assume 21 days; if no duration given, use 7 days)
2. Reflects their interests, party type, and trip style
3. Decides on a sensible number of stops based on their "style" answer: "One base, total relaxation" or "One base with day trips" → exactly 1 stop; "Two or three stops" → 2-3 stops; "Full multi-stop tour" → 3-5 stops; "Cruise or river cruise" → treat each port as a stop with 1 night each; if no style given, choose what's genuinely sensible for the trip length and destination (their current style answer is: "${styleAnswer || "not specified"}")
4. For EACH stop, recommend 2-3 specific real, current, well-reviewed accommodation options at different price points if possible — actual named hotels/guesthouses/resorts you find via search, not generic placeholders
5. Splits the nights across stops sensibly (nights per stop should add up to roughly the total trip length minus travel days)
6. Is grounded in real, current recommendations you find via search — not generic filler

Respond ONLY with valid JSON (no markdown formatting, no backticks, no extra commentary) in exactly this shape:

{
  "summary": "2-3 sentence overview of the trip and why it suits this client specifically",
  "bestTimeToVisit": "1 sentence on timing relevant to their stated weather/season preference",
  "stops": [
    {
      "stopNumber": 1,
      "area": "Area or town name for this stop",
      "nights": 4,
      "whyStay": "1-2 sentences on why this area suits them at this point in the trip",
      "accommodationOptions": [
        { "name": "Real hotel/guesthouse name", "type": "e.g. Boutique hotel / Resort / Guesthouse", "whyGoodFit": "1 sentence on why this specific property suits them", "priceIndicator": "Budget / Mid-range / Premium / Luxury" }
      ]
    }
  ],
  "days": [
    { "day": 1, "title": "Short title for the day", "description": "2-3 sentences on what to do, grounded in real current recommendations, noting which stop/area this day takes place in" }
  ],
  "sources": [
    { "title": "Name of the source site/article", "url": "https://..." }
  ]
}

Include 2-3 accommodation options per stop, and one day entry per day for the full itinerary length. Include genuine sources you actually used — only include a source if you actually found and used it via search, with its real URL.`;
}

export async function generateItinerary(
  destination: Destination,
  answers: PlannerAnswers
): Promise<AiItinerary> {
  const response = await fetch(ANTHROPIC_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": process.env.ANTHROPIC_API_KEY || "",
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: MODEL,
      max_tokens: 6000,
      messages: [{ role: "user", content: buildPrompt(destination, answers) }],
      tools: [{ type: "web_search_20250305", name: "web_search" }],
    }),
  });

  const json = await response.json();

  if (json.error) {
    throw new Error(json.error.message || "Unknown Anthropic API error");
  }

  const textBlocks = (json.content || [])
    .filter((block: any) => block.type === "text")
    .map((block: any) => block.text)
    .join("\n");

  const cleaned = textBlocks.replace(/```json|```/g, "").trim();

  let parsed: any;
  try {
    parsed = JSON.parse(cleaned);
  } catch {
    // Try to extract a JSON object if the model wrapped it in any prose.
    const match = cleaned.match(/\{[\s\S]*\}/);
    if (!match) throw new Error("Could not parse itinerary response");
    parsed = JSON.parse(match[0]);
  }

  return {
    destinationSlug: destination.slug,
    summary: parsed.summary || "",
    bestTimeToVisit: parsed.bestTimeToVisit || "",
    stops: Array.isArray(parsed.stops) ? parsed.stops : [],
    days: Array.isArray(parsed.days) ? parsed.days : [],
    sources: Array.isArray(parsed.sources) ? parsed.sources : [],
  };
}

// ─── AI Destination Discovery ─────────────────────────────────────────────────
//
// Uses Claude with web search to find destinations from anywhere in the world
// that match a visitor's planner answers. Returns a streaming response so the
// browser can display live progress messages while Claude researches.
//
// The stream emits newline-delimited JSON events:
//   { type: "progress", message: "Checking what's in season..." }
//   { type: "result", destinations: [...] }
//   { type: "error", message: "..." }

export type AiDestinationSuggestion = {
  name: string;
  country: string;
  region: string;
  emoji: string;
  tagline: string;
  whyMatch: string;
  highlights: string[];
  bestTimeToVisit: string;
  flightTime: string;
  priceIndicator: string;
  iata: string;
  lat: number;
  lng: number;
};

function buildDestinationSearchPrompt(
  answers: PlannerAnswers,
  count: number
): string {
  const answerLines = Object.entries(answers)
    .filter(([, values]) => values && values.length > 0)
    .map(([key, values]) => `- ${key}: ${(values as string[]).join(", ")}`)
    .join("\n");

  return `You are a senior Trailfinders-style travel consultant with expert knowledge of destinations worldwide. A customer has just completed our travel planning questionnaire.

Customer's answers:
${answerLines || "- No preferences given — suggest a varied, globally representative shortlist"}

Your task: use web search to find exactly ${count} destinations from anywhere in the world that genuinely match this customer's answers. Don't limit yourself to obvious choices — think like a real advisor who knows hidden gems, not just the top Google results. Consider:
- Destinations currently in season for their travel dates / weather preference
- Flight time constraints as a hard filter (e.g. "Short-haul (up to 3 hours)" from London rules out anything over ~3h flight time)
- Party type (a young family needs very different things from a solo adventurer)
- Budget compatibility
- Their specific interests and trip style

Search for:
1. Current "best destinations for [their interests] [current season]" from reputable travel sources
2. Hidden gem or lesser-known alternatives that fit their profile
3. Verify flight times from London for each candidate

Return ONLY valid JSON (no markdown, no backticks, no commentary) as an array of exactly ${count} objects:

[
  {
    "name": "Destination or city name",
    "country": "Country name",
    "region": "e.g. Southern Europe / Southeast Asia / Caribbean",
    "emoji": "Single relevant emoji",
    "tagline": "One punchy sentence that would make someone want to go",
    "whyMatch": "2-3 sentences explaining specifically why this matches their answers — be concrete, reference their actual preferences",
    "highlights": ["highlight 1", "highlight 2", "highlight 3"],
    "bestTimeToVisit": "One sentence on timing for their stated weather/date preference",
    "flightTime": "Approximate flight time from London e.g. '2h 30m direct'",
    "priceIndicator": "Budget / Mid-range / Premium / Luxury",
    "iata": "IATA code for the nearest major airport e.g. BCN",
    "lat": 41.3874,
    "lng": 2.1686
  }
]

Ensure geographic variety — don't return ${count} destinations from the same country or region unless the customer specifically requested a region. At least one suggestion should be a destination the customer may not have considered.`;
}

// Streams newline-delimited JSON progress events and a final result event.
// The caller (the API route) pipes this directly to a Next.js streaming
// Response so the browser receives updates in real time.
export async function streamDestinationSearch(
  answers: PlannerAnswers,
  count: number,
  onProgress: (message: string) => void
): Promise<AiDestinationSuggestion[]> {
  const progressMessages = [
    "Thinking about what suits you best...",
    "Searching for destinations that match your interests...",
    "Checking what's in season for your weather preference...",
    "Verifying flight times from London...",
    "Looking for hidden gems you might not have considered...",
    "Cross-checking reviews and current recommendations...",
    "Putting your shortlist together...",
  ];

  // Emit progress messages on a timer while the real API call runs.
  let msgIndex = 0;
  onProgress(progressMessages[msgIndex]);
  const progressInterval = setInterval(() => {
    msgIndex = Math.min(msgIndex + 1, progressMessages.length - 1);
    onProgress(progressMessages[msgIndex]);
  }, 4000);

  try {
    const response = await fetch(ANTHROPIC_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.ANTHROPIC_API_KEY || "",
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: MODEL,
        max_tokens: 4000,
        messages: [
          { role: "user", content: buildDestinationSearchPrompt(answers, count) },
        ],
        tools: [{ type: "web_search_20250305", name: "web_search" }],
      }),
    });

    const json = await response.json();

    if (json.error) {
      throw new Error(json.error.message || "Unknown Anthropic API error");
    }

    const textBlocks = (json.content || [])
      .filter((block: any) => block.type === "text")
      .map((block: any) => block.text)
      .join("\n");

    const cleaned = textBlocks.replace(/```json|```/g, "").trim();

    let parsed: any;
    try {
      parsed = JSON.parse(cleaned);
    } catch {
      const match = cleaned.match(/\[[\s\S]*\]/);
      if (!match) throw new Error("Could not parse destination search response");
      parsed = JSON.parse(match[0]);
    }

    if (!Array.isArray(parsed)) {
      throw new Error("Expected an array of destinations");
    }

    return parsed.slice(0, count).map((d: any) => ({
      name: d.name || "Unknown",
      country: d.country || "",
      region: d.region || "",
      emoji: d.emoji || "🌍",
      tagline: d.tagline || "",
      whyMatch: d.whyMatch || "",
      highlights: Array.isArray(d.highlights) ? d.highlights : [],
      bestTimeToVisit: d.bestTimeToVisit || "",
      flightTime: d.flightTime || "",
      priceIndicator: d.priceIndicator || "Mid-range",
      iata: d.iata || "",
      lat: Number(d.lat) || 0,
      lng: Number(d.lng) || 0,
    }));
  } finally {
    clearInterval(progressInterval);
  }
}
