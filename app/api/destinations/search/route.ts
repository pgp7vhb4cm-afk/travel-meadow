import { NextRequest } from "next/server";
import { hasAnthropicKey, streamDestinationSearch } from "@/lib/anthropic";
import { DESTINATIONS } from "@/lib/destinations";

// POST /api/destinations/search
//
// Body: { answers: Record<string, string[]> }
//
// Returns a text/event-stream (SSE) response with newline-delimited JSON:
//   { type: "progress", message: "..." }   — shown live in the UI
//   { type: "result", destinations: [...] } — final AI suggestions
//   { type: "error", message: "..." }       — something went wrong
//
// Without an Anthropic key, immediately returns mock results drawn from
// the curated destination list so the site stays fully usable.
export async function POST(request: NextRequest) {
  let body: any;
  try {
    body = await request.json();
  } catch {
    return errorStream("Invalid JSON body");
  }

  const answers =
    body?.answers && typeof body.answers === "object" ? body.answers : {};

  // No API key — fall back to the curated list immediately, no streaming needed.
  if (!hasAnthropicKey()) {
    const mockResults = DESTINATIONS.slice(0, 3).map((d) => ({
      name: d.name,
      country: d.country,
      region: d.tags.region?.[0] || "",
      emoji: d.emoji,
      tagline: d.tagline,
      whyMatch: d.why,
      highlights: d.highlights,
      bestTimeToVisit: d.meta.find((m) => m.icon === "calendar")?.label || "",
      flightTime: d.meta.find((m) => m.icon === "plane")?.label || "",
      priceIndicator:
        d.meta.find((m) => m.icon === "wallet")?.label || "Mid-range",
      iata: d.iata,
      lat: d.lat,
      lng: d.lng,
    }));

    const body =
      JSON.stringify({ type: "progress", message: "Finding your matches..." }) +
      "\n" +
      JSON.stringify({ type: "result", destinations: mockResults, source: "mock" }) +
      "\n";

    return new Response(body, {
      headers: {
        "Content-Type": "application/x-ndjson",
        "Cache-Control": "no-cache",
      },
    });
  }

  // Stream progress + result back to the client.
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      function emit(obj: object) {
        controller.enqueue(encoder.encode(JSON.stringify(obj) + "\n"));
      }

      try {
        const destinations = await streamDestinationSearch(
          answers,
          3,
          (message) => emit({ type: "progress", message })
        );
        emit({ type: "result", destinations, source: "ai" });
      } catch (error: any) {
        emit({
          type: "error",
          message: error?.message || "Something went wrong finding destinations",
        });
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "application/x-ndjson",
      "Cache-Control": "no-cache",
      "X-Content-Type-Options": "nosniff",
    },
  });
}

function errorStream(message: string) {
  const body = JSON.stringify({ type: "error", message }) + "\n";
  return new Response(body, {
    status: 400,
    headers: { "Content-Type": "application/x-ndjson" },
  });
}
