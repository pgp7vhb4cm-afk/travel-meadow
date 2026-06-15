import { NextRequest, NextResponse } from "next/server";
import { hasDuffelKey, searchFlights } from "@/lib/duffel";
import { mockFlights } from "@/lib/mockData";

// POST /api/flights/search
//
// Body: { origin, destination, departureDate, returnDate?, passengers }
//
// This route runs on the server, so the Duffel API key (read from
// process.env.DUFFEL_API_KEY inside lib/duffel.ts) is never sent to the
// browser. The frontend only ever talks to this route.
export async function POST(request: NextRequest) {
  let body: any;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { origin, destination, departureDate, returnDate, passengers } = body || {};

  if (!origin || !destination || !departureDate) {
    return NextResponse.json(
      { error: "origin, destination and departureDate are required" },
      { status: 400 }
    );
  }

  const passengerCount = Number(passengers) || 1;

  // No API key configured — return sample data so the site still works.
  if (!hasDuffelKey()) {
    return NextResponse.json({
      source: "mock",
      offers: mockFlights(origin, destination, departureDate, passengerCount),
    });
  }

  try {
    const offers = await searchFlights({
      origin,
      destination,
      departureDate,
      returnDate,
      passengers: passengerCount,
    });

    if (offers.length === 0) {
      return NextResponse.json({
        source: "mock",
        offers: mockFlights(origin, destination, departureDate, passengerCount),
        warning: "No live offers were found for these dates — showing sample results instead.",
      });
    }

    return NextResponse.json({ source: "duffel", offers });
  } catch (error: any) {
    return NextResponse.json({
      source: "mock",
      offers: mockFlights(origin, destination, departureDate, passengerCount),
      warning: `Duffel API error: ${error.message || "unknown error"} — showing sample results instead.`,
    });
  }
}
