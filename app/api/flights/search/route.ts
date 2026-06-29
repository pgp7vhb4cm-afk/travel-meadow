import { NextRequest, NextResponse } from "next/server";
import { hasDuffelKey, searchFlights } from "@/lib/duffel";
import { mockFlights } from "@/lib/mockData";

export async function POST(request: NextRequest) {
  let body: any;
  try { body = await request.json(); } catch { return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 }); }

  const { origin, destination, departureDate, returnDate, adults, childAges } = body || {};
  if (!origin || !destination || !departureDate) return NextResponse.json({ error: "origin, destination and departureDate are required" }, { status: 400 });

  const adultCount = Number(adults) || 1;
  const parsedChildAges: number[] = Array.isArray(childAges)
    ? childAges.map((a: any) => Number(a)).filter((a: number) => Number.isFinite(a))
    : [];
  if (parsedChildAges.some((a) => a < 0 || a > 17)) return NextResponse.json({ error: "Child ages must be between 0 and 17" }, { status: 400 });
  const totalPassengers = adultCount + parsedChildAges.length;

  if (!hasDuffelKey()) return NextResponse.json({ source: "mock", offers: mockFlights(origin, destination, departureDate, totalPassengers) });

  try {
    const offers = await searchFlights({ origin, destination, departureDate, returnDate, adults: adultCount, childAges: parsedChildAges });
    if (offers.length === 0) return NextResponse.json({ source: "mock", offers: mockFlights(origin, destination, departureDate, totalPassengers), warning: "No live offers found — showing sample results." });
    return NextResponse.json({ source: "duffel", offers });
  } catch (error: any) {
    return NextResponse.json({ source: "mock", offers: mockFlights(origin, destination, departureDate, totalPassengers), warning: `Duffel error: ${error.message}` });
  }
}
