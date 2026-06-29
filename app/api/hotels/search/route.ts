import { NextRequest, NextResponse } from "next/server";
import { hasDuffelKey, searchHotels } from "@/lib/duffel";
import { mockHotels } from "@/lib/mockData";

export async function POST(request: NextRequest) {
  let body: any;
  try { body = await request.json(); } catch { return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 }); }

  const { latitude, longitude, city, checkInDate, checkOutDate, guests } = body || {};
  if (typeof latitude !== "number" || typeof longitude !== "number" || !checkInDate || !checkOutDate) {
    return NextResponse.json({ error: "latitude, longitude, checkInDate and checkOutDate are required" }, { status: 400 });
  }

  const guestCount = Number(guests) || 1;
  const cityLabel = city || "this area";

  if (!hasDuffelKey()) return NextResponse.json({ source: "mock", hotels: mockHotels(cityLabel) });

  try {
    const hotels = await searchHotels({ latitude, longitude, checkInDate, checkOutDate, guests: guestCount });
    if (hotels.length === 0) return NextResponse.json({ source: "mock", hotels: mockHotels(cityLabel), warning: "No live results found — showing sample results." });
    return NextResponse.json({ source: "duffel", hotels });
  } catch (error: any) {
    return NextResponse.json({ source: "mock", hotels: mockHotels(cityLabel), warning: `Duffel error: ${error.message}` });
  }
}
