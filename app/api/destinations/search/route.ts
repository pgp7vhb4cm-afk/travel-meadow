import { NextRequest } from "next/server";
import { hasAnthropicKey, streamDestinationSearch } from "@/lib/anthropic";
import { DESTINATIONS } from "@/lib/destinations";

export async function POST(request: NextRequest) {
  let body: any;
  try { body = await request.json(); } catch {
    return new Response(JSON.stringify({ type: "error", message: "Invalid JSON" }) + "\n", { status: 400, headers: { "Content-Type": "application/x-ndjson" } });
  }

  const answers = body?.answers && typeof body.answers === "object" ? body.answers : {};

  if (!hasAnthropicKey()) {
    const mock = DESTINATIONS.slice(0, 3).map((d) => ({
      name: d.name, country: d.country, region: d.tags.region?.[0] || "",
      emoji: d.emoji, tagline: d.tagline, whyMatch: d.why, highlights: d.highlights,
      bestTimeToVisit: d.meta.find((m) => m.icon === "calendar")?.label || "",
      flightTime: d.meta.find((m) => m.icon === "plane")?.label || "",
      priceIndicator: d.meta.find((m) => m.icon === "wallet")?.label || "Mid-range",
      iata: d.iata, lat: d.lat, lng: d.lng,
    }));
    const body2 = JSON.stringify({ type: "progress", message: "Finding your matches..." }) + "\n" + JSON.stringify({ type: "result", destinations: mock, source: "mock" }) + "\n";
    return new Response(body2, { headers: { "Content-Type": "application/x-ndjson", "Cache-Control": "no-cache" } });
  }

  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      function emit(obj: object) { controller.enqueue(encoder.encode(JSON.stringify(obj) + "\n")); }
      try {
        const destinations = await streamDestinationSearch(answers, 3, (message) => emit({ type: "progress", message }));
        emit({ type: "result", destinations, source: "ai" });
      } catch (error: any) {
        emit({ type: "error", message: error?.message || "Something went wrong" });
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, { headers: { "Content-Type": "application/x-ndjson", "Cache-Control": "no-cache" } });
}
