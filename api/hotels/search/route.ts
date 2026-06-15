import { NextRequest, NextResponse } from "next/server";
import { hasDuffelKey, searchHotels } from "@/lib/duffel";
import { mockHotels } from "@/lib/mockData";

// POST /api/hotels/search
//
// Body: { latitude, longitude, city, checkInDate, checkOutDate, guests }
//
// This route runs on the server, so the Duffel API key is never sent to
// the browser. The frontend only ever talks to this route.
export async function POST(request: NextRequest) {
  let body: any;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { latitude, longitude, city, checkInDate, checkOutDate, guests } = body || {};

  if (
    typeof latitude !== "number" ||
    typeof longitude !== "number" ||
    !checkInDate ||
    !checkOutDate
  ) {
    return NextResponse.json(
      { error: "latitude, longitude, checkInDate and checkOutDate are required" },
      { status: 400 }
    );
  }

  const guestCount = Number(guests) || 1;
  const cityLabel = city || "this area";

  if (!hasDuffelKey()) {
    return NextResponse.json({
      source: "mock",
      hotels: mockHotels(cityLabel),
    });
  }

  try {
    const hotels = await searchHotels({
      latitude,
      longitude,
      checkInDate,
      checkOutDate,
      guests: guestCount,
    });

    if (hotels.length === 0) {
      return NextResponse.json({
        source: "mock",
        hotels: mockHotels(cityLabel),
        warning: "No live results were found for these dates — showing sample results instead.",
      });
    }

    return NextResponse.json({ source: "duffel", hotels });
  } catch (error: any) {
    return NextResponse.json({
      source: "mock",
      hotels: mockHotels(cityLabel),
      warning: `Duffel API error: ${error.message || "unknown error"} — showing sample results instead.`,
    });
  }
}
