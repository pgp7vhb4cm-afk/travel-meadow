import { NextRequest, NextResponse } from "next/server";
import { hasAnthropicKey, generateItinerary } from "@/lib/anthropic";
import { mockItinerary } from "@/lib/mockData";
import { getDestinationBySlug } from "@/lib/destinations";

// POST /api/itinerary
//
// Body: { slug: string, answers: Record<string, string[]> }
//
// This route runs on the server, so the Anthropic API key is never sent
// to the browser. It uses Claude with web search enabled to ground the
// itinerary in current, real travel recommendations rather than relying
// purely on the model's training data.
export async function POST(request: NextRequest) {
  let body: any;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { slug, answers } = body || {};

  if (!slug) {
    return NextResponse.json({ error: "slug is required" }, { status: 400 });
  }

  const destination = getDestinationBySlug(slug);
  if (!destination) {
    return NextResponse.json({ error: "Unknown destination" }, { status: 404 });
  }

  const safeAnswers = answers && typeof answers === "object" ? answers : {};

  if (!hasAnthropicKey()) {
    return NextResponse.json({
      source: "mock",
      itinerary: mockItinerary(destination, safeAnswers),
    });
  }

  try {
    const itinerary = await generateItinerary(destination, safeAnswers);
    return NextResponse.json({ source: "ai", itinerary });
  } catch (error: any) {
    return NextResponse.json({
      source: "mock",
      itinerary: mockItinerary(destination, safeAnswers),
      warning: `AI itinerary error: ${error.message || "unknown error"} — showing a sample outline instead.`,
    });
  }
}
