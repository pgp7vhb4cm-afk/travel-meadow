// Server-side Duffel API client.
//
// IMPORTANT: This file should only ever be imported from code that runs on
// the server (e.g. files inside app/api/.../route.ts). It reads
// process.env.DUFFEL_API_KEY, which must never be exposed to the browser.
//
// Docs: https://duffel.com/docs

const DUFFEL_API_URL = "https://api.duffel.com";

function getDuffelHeaders() {
  const apiKey = process.env.DUFFEL_API_KEY;
  return {
    Authorization: `Bearer ${apiKey}`,
    "Content-Type": "application/json",
    "Duffel-Version": "v2",
    Accept: "application/json",
  };
}

export function hasDuffelKey(): boolean {
  return Boolean(process.env.DUFFEL_API_KEY);
}

export type FlightOffer = {
  id: string;
  totalAmount: string;
  totalCurrency: string;
  carrierName: string;
  carrierCode: string;
  departingAt: string;
  arrivingAt: string;
  duration: string;
  stops: number;
};

export async function searchFlights(params: {
  origin: string;
  destination: string;
  departureDate: string;
  returnDate?: string;
  adults: number;
  // Age (in years) for each child traveller. Duffel requires the age of
  // any passenger under 18 — children are represented as { age } rather
  // than { type: "adult" } — since airlines price and require different
  // info for child/infant fares.
  childAges?: number[];
}): Promise<FlightOffer[]> {
  const { origin, destination, departureDate, returnDate, adults, childAges = [] } = params;

  const slices: { origin: string; destination: string; departure_date: string }[] = [
    { origin, destination, departure_date: departureDate },
  ];
  if (returnDate) {
    slices.push({ origin: destination, destination: origin, departure_date: returnDate });
  }

  const passengers = [
    ...Array.from({ length: Math.max(1, adults) }, () => ({ type: "adult" })),
    ...childAges.map((age) => ({ age })),
  ];

  const response = await fetch(`${DUFFEL_API_URL}/air/offer_requests?return_offers=true`, {
    method: "POST",
    headers: getDuffelHeaders(),
    body: JSON.stringify({
      data: {
        slices,
        passengers,
        cabin_class: "economy",
      },
    }),
  });

  const json = await response.json();

  if (json.errors) {
    const message = json.errors[0]?.message || "Unknown Duffel error";
    throw new Error(message);
  }

  const offers = (json.data?.offers || []) as any[];

  return offers.slice(0, 6).map((offer) => {
    const itinerary = offer.itineraries[0];
    const segments = itinerary.slices[0].segments;
    const firstSegment = segments[0];
    const lastSegment = segments[segments.length - 1];

    return {
      id: offer.id,
      totalAmount: offer.total_amount,
      totalCurrency: offer.total_currency,
      carrierName:
        firstSegment.marketing_carrier?.name ||
        firstSegment.operating_carrier?.name ||
        "Unknown airline",
      carrierCode:
        firstSegment.marketing_carrier?.iata_code ||
        firstSegment.operating_carrier?.iata_code ||
        "",
      departingAt: firstSegment.departing_at,
      arrivingAt: lastSegment.arriving_at,
      duration: itinerary.slices[0].duration,
      stops: segments.length - 1,
    };
  });
}

export type HotelOffer = {
  id: string;
  name: string;
  city: string;
  starRating: number;
  pricePerNight: string | null;
  currency: string | null;
  amenities: string[];
};

export async function searchHotels(params: {
  latitude: number;
  longitude: number;
  checkInDate: string;
  checkOutDate: string;
  guests: number;
}): Promise<HotelOffer[]> {
  const { latitude, longitude, checkInDate, checkOutDate, guests } = params;

  const response = await fetch(`${DUFFEL_API_URL}/stays/search`, {
    method: "POST",
    headers: getDuffelHeaders(),
    body: JSON.stringify({
      data: {
        rooms: 1,
        guests: Array.from({ length: Math.max(1, guests) }, () => ({
          type: "adult",
        })),
        check_in_date: checkInDate,
        check_out_date: checkOutDate,
        location: {
          radius: 15,
          radius_unit: "km",
          geographic_coordinates: { latitude, longitude },
        },
      },
    }),
  });

  const json = await response.json();

  if (json.errors) {
    const message = json.errors[0]?.message || "Unknown Duffel error";
    throw new Error(message);
  }

  const results = (json.data?.results || []) as any[];

  return results.slice(0, 6).map((result) => {
    const accommodation = result.accommodation || {};
    const amenities = (accommodation.amenities || [])
      .map((a: any) => a.description || a.type)
      .filter(Boolean)
      .slice(0, 4);

    return {
      id: result.id,
      name: accommodation.name || "Hotel",
      city: accommodation.location?.address?.city_name || "",
      starRating: accommodation.star_rating || 0,
      pricePerNight: result.cheapest_rate_total_amount || null,
      currency: result.cheapest_rate_currency || null,
      amenities,
    };
  });
}
