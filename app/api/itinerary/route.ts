import { NextRequest, NextResponse } from "next/server";
import { hasAnthropicKey, generateItinerary } from "@/lib/anthropic";
import { mockItinerary } from "@/lib/mockData";
import { getDestinationBySlug } from "@/lib/destinations";
import type { Destination } from "@/lib/destinations";

export async function POST(request: NextRequest) {
  let body: any;
  try { body = await request.json(); } catch { return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 }); }

  const { slug, answers, customDestination } = body || {};
  const safeAnswers = answers && typeof answers === "object" ? answers : {};

  let destination: Destination | undefined = getDestinationBySlug(slug);

  if (!destination && customDestination?.name) {
    destination = {
      slug: slug || customDestination.name.toLowerCase().replace(/\s+/g, "-"),
      name: customDestination.name, country: customDestination.country || "",
      emoji: "🌍", tagline: `Discover ${customDestination.name}`,
      why: `${customDestination.name} is an AI-recommended destination.`,
      bannerColor: "#1a6b4a", meta: [], highlights: [], tips: [],
      iata: customDestination.iata || "", city: customDestination.city || customDestination.name,
      lat: customDestination.lat || 0, lng: customDestination.lng || 0,
      tags: { region: [], party: [], interest: [], weather: [], duration: [], travelTime: [], style: [], budget: [] },
    };
  }

  if (!destination) return NextResponse.json({ error: "Unknown destination" }, { status: 404 });

  if (!hasAnthropicKey()) return NextResponse.json({ source: "mock", itinerary: mockItinerary(destination, safeAnswers) });

  try {
    const itinerary = await generateItinerary(destination, safeAnswers);
    return NextResponse.json({ source: "ai", itinerary });
  } catch (error: any) {
    return NextResponse.json({ source: "mock", itinerary: mockItinerary(destination, safeAnswers), warning: `AI error: ${error.message}` });
  }
}
