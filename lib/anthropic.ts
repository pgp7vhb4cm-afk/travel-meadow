// Server-side Anthropic API client for AI-powered itinerary generation.
//
// IMPORTANT: This file should only ever be imported from server code
// (e.g. app/api/.../route.ts). It reads process.env.ANTHROPIC_API_KEY,
// which must never be exposed to the browser.
//
// This uses Claude with the web_search tool so recommendations are
// grounded in what reputable travel sites are currently saying, rather
// than relying purely on the model's training data — important for
// things like "best area to stay" or "current top-rated tours", which
// change over time.
//
// Docs: https://docs.claude.com/en/docs/agents-and-tools/tool-use/web-search-tool

import type { Destination } from "./destinations";

const ANTHROPIC_API_URL = "https://api.anthropic.com/v1/messages";
const MODEL = "claude-sonnet-4-5";

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
