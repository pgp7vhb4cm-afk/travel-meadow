import type { Destination } from "./destinations";

const ANTHROPIC_API_URL = "https://api.anthropic.com/v1/messages";
const MODEL = "claude-sonnet-4-6";

export function hasAnthropicKey(): boolean {
  return Boolean(process.env.ANTHROPIC_API_KEY);
}

// ─── Itinerary Types ──────────────────────────────────────────────────────────

export type ItineraryDay = { day: number; title: string; description: string };
export type AccommodationOption = { name: string; type: string; whyGoodFit: string; priceIndicator: string };
export type ItineraryStop = { stopNumber: number; area: string; nights: number; whyStay: string; accommodationOptions: AccommodationOption[] };
export type ItinerarySource = { title: string; url: string };
export type AiItinerary = {
  destinationSlug: string; summary: string; bestTimeToVisit: string;
  stops: ItineraryStop[]; days: ItineraryDay[]; sources: ItinerarySource[];
};
export type PlannerAnswers = Partial<Record<string, string[]>>;

function buildItineraryPrompt(destination: Destination, answers: PlannerAnswers): string {
  const answerLines = Object.entries(answers)
    .filter(([, v]) => v && v.length > 0)
    .map(([k, v]) => `- ${k}: ${(v as string[]).join(", ")}`)
    .join("\n");
  const styleAnswer = answers.style?.[0];
  return `You are a senior Trailfinders-style travel consultant building a tailored itinerary.

Destination: ${destination.name}, ${destination.country}

Client preferences:
${answerLines || "- No specific preferences given"}

Use web search for current recommendations. Build an itinerary that:
1. Matches their duration (Long weekend=4 days, One week=7, 10-12 days=11, Two weeks=14, Three weeks+=21; default 7)
2. Reflects their interests and trip style
3. Number of stops based on style answer "${styleAnswer || "not specified"}": "One base"=1 stop, "Two or three stops"=2-3, "Full multi-stop tour"=3-5, "Cruise"=1 per port
4. For EACH stop: 2-3 real, named, currently-reviewed accommodation options at different price points
5. Is grounded in real current recommendations from web search

Return ONLY valid JSON (no markdown, no backticks):
{
  "summary": "2-3 sentences why this trip suits this client",
  "bestTimeToVisit": "1 sentence on timing",
  "stops": [{ "stopNumber": 1, "area": "Area name", "nights": 4, "whyStay": "1-2 sentences", "accommodationOptions": [{ "name": "Real hotel name", "type": "Boutique hotel", "whyGoodFit": "1 sentence", "priceIndicator": "Mid-range" }] }],
  "days": [{ "day": 1, "title": "Day title", "description": "2-3 sentences on what to do" }],
  "sources": [{ "title": "Source name", "url": "https://..." }]
}`;
}

export async function generateItinerary(destination: Destination, answers: PlannerAnswers): Promise<AiItinerary> {
  const response = await fetch(ANTHROPIC_API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-api-key": process.env.ANTHROPIC_API_KEY || "", "anthropic-version": "2023-06-01" },
    body: JSON.stringify({ model: MODEL, max_tokens: 6000, messages: [{ role: "user", content: buildItineraryPrompt(destination, answers) }], tools: [{ type: "web_search_20250305", name: "web_search" }] }),
  });
  const json = await response.json();
  if (json.error) throw new Error(json.error.message || "Unknown Anthropic error");
  const text = (json.content || []).filter((b: any) => b.type === "text").map((b: any) => b.text).join("\n");
  const cleaned = text.replace(/```json|```/g, "").trim();
  let parsed: any;
  try { parsed = JSON.parse(cleaned); } catch {
    const match = cleaned.match(/\{[\s\S]*\}/);
    if (!match) throw new Error("Could not parse itinerary");
    parsed = JSON.parse(match[0]);
  }
  return {
    destinationSlug: destination.slug, summary: parsed.summary || "",
    bestTimeToVisit: parsed.bestTimeToVisit || "",
    stops: Array.isArray(parsed.stops) ? parsed.stops : [],
    days: Array.isArray(parsed.days) ? parsed.days : [],
    sources: Array.isArray(parsed.sources) ? parsed.sources : [],
  };
}

// ─── AI Destination Discovery ─────────────────────────────────────────────────

export type AiDestinationSuggestion = {
  name: string; country: string; region: string; emoji: string;
  tagline: string; whyMatch: string; highlights: string[];
  bestTimeToVisit: string; flightTime: string; priceIndicator: string;
  iata: string; lat: number; lng: number;
};

function buildDestinationSearchPrompt(answers: PlannerAnswers, count: number): string {
  const answerLines = Object.entries(answers)
    .filter(([, v]) => v && v.length > 0)
    .map(([k, v]) => `- ${k}: ${(v as string[]).join(", ")}`)
    .join("\n");
  return `You are a senior Trailfinders-style travel consultant. A customer completed our trip planner.

Customer answers:
${answerLines || "- No preferences — suggest a varied global shortlist"}

Find exactly ${count} destinations from anywhere in the world that genuinely match. Use web search to check current recommendations, what's in season, and verify flight times from London. Treat flight time as a hard constraint. Ensure geographic variety.

Return ONLY a valid JSON array (no markdown, no backticks) of exactly ${count} objects:
[{
  "name": "City/destination name",
  "country": "Country",
  "region": "e.g. Southern Europe",
  "emoji": "single emoji",
  "tagline": "One punchy sentence",
  "whyMatch": "2-3 sentences why this matches their specific answers",
  "highlights": ["highlight 1", "highlight 2", "highlight 3"],
  "bestTimeToVisit": "One sentence on timing",
  "flightTime": "e.g. 2h 30m direct from London",
  "priceIndicator": "Budget / Mid-range / Premium / Luxury",
  "iata": "Airport IATA code e.g. BCN",
  "lat": 41.3874,
  "lng": 2.1686
}]`;
}

export async function streamDestinationSearch(
  answers: PlannerAnswers,
  count: number,
  onProgress: (message: string) => void
): Promise<AiDestinationSuggestion[]> {
  const messages = [
    "Thinking about what suits you best...",
    "Searching destinations worldwide...",
    "Checking what's in season...",
    "Verifying flight times from London...",
    "Looking for hidden gems...",
    "Cross-checking reviews...",
    "Putting your shortlist together...",
  ];
  let idx = 0;
  onProgress(messages[0]);
  const interval = setInterval(() => { idx = Math.min(idx + 1, messages.length - 1); onProgress(messages[idx]); }, 4000);
  try {
    const response = await fetch(ANTHROPIC_API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-api-key": process.env.ANTHROPIC_API_KEY || "", "anthropic-version": "2023-06-01" },
      body: JSON.stringify({ model: MODEL, max_tokens: 4000, messages: [{ role: "user", content: buildDestinationSearchPrompt(answers, count) }], tools: [{ type: "web_search_20250305", name: "web_search" }] }),
    });
    const json = await response.json();
    if (json.error) throw new Error(json.error.message || "Unknown Anthropic error");
    const text = (json.content || []).filter((b: any) => b.type === "text").map((b: any) => b.text).join("\n");
    const cleaned = text.replace(/```json|```/g, "").trim();
    let parsed: any;
    try { parsed = JSON.parse(cleaned); } catch {
      const match = cleaned.match(/\[[\s\S]*\]/);
      if (!match) throw new Error("Could not parse destination results");
      parsed = JSON.parse(match[0]);
    }
    if (!Array.isArray(parsed)) throw new Error("Expected array of destinations");
    return parsed.slice(0, count).map((d: any) => ({
      name: d.name || "Unknown", country: d.country || "", region: d.region || "",
      emoji: d.emoji || "🌍", tagline: d.tagline || "", whyMatch: d.whyMatch || "",
      highlights: Array.isArray(d.highlights) ? d.highlights : [],
      bestTimeToVisit: d.bestTimeToVisit || "", flightTime: d.flightTime || "",
      priceIndicator: d.priceIndicator || "Mid-range", iata: d.iata || "",
      lat: Number(d.lat) || 0, lng: Number(d.lng) || 0,
    }));
  } finally {
    clearInterval(interval);
  }
}
