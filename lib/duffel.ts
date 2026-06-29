const DUFFEL_API_URL = "https://api.duffel.com";

function getDuffelHeaders() {
  return {
    Authorization: `Bearer ${process.env.DUFFEL_API_KEY}`,
    "Content-Type": "application/json",
    "Duffel-Version": "v2",
    Accept: "application/json",
  };
}

export function hasDuffelKey(): boolean {
  return Boolean(process.env.DUFFEL_API_KEY);
}

export type FlightOffer = {
  id: string; totalAmount: string; totalCurrency: string;
  carrierName: string; carrierCode: string;
  departingAt: string; arrivingAt: string; duration: string; stops: number;
};

export async function searchFlights(params: {
  origin: string; destination: string; departureDate: string;
  returnDate?: string; adults: number; childAges?: number[];
}): Promise<FlightOffer[]> {
  const { origin, destination, departureDate, returnDate, adults, childAges = [] } = params;
  const slices: { origin: string; destination: string; departure_date: string }[] = [
    { origin, destination, departure_date: departureDate },
  ];
  if (returnDate) slices.push({ origin: destination, destination: origin, departure_date: returnDate });

  const passengers = [
    ...Array.from({ length: Math.max(1, adults) }, () => ({ type: "adult" })),
    ...childAges.map((age) => ({ age })),
  ];

  const response = await fetch(`${DUFFEL_API_URL}/air/offer_requests?return_offers=true`, {
    method: "POST", headers: getDuffelHeaders(),
    body: JSON.stringify({ data: { slices, passengers, cabin_class: "economy" } }),
  });
  const json = await response.json();
  if (json.errors) throw new Error(json.errors[0]?.message || "Unknown Duffel error");

  return ((json.data?.offers || []) as any[]).slice(0, 6).map((offer) => {
    const it = offer.itineraries[0];
    const segs = it.slices[0].segments;
    const first = segs[0]; const last = segs[segs.length - 1];
    return {
      id: offer.id, totalAmount: offer.total_amount, totalCurrency: offer.total_currency,
      carrierName: first.marketing_carrier?.name || first.operating_carrier?.name || "Unknown",
      carrierCode: first.marketing_carrier?.iata_code || first.operating_carrier?.iata_code || "",
      departingAt: first.departing_at, arrivingAt: last.arriving_at,
      duration: it.slices[0].duration, stops: segs.length - 1,
    };
  });
}

export type HotelOffer = {
  id: string; name: string; city: string; starRating: number;
  pricePerNight: string | null; currency: string | null; amenities: string[];
};

export async function searchHotels(params: {
  latitude: number; longitude: number;
  checkInDate: string; checkOutDate: string; guests: number;
}): Promise<HotelOffer[]> {
  const { latitude, longitude, checkInDate, checkOutDate, guests } = params;
  const response = await fetch(`${DUFFEL_API_URL}/stays/search`, {
    method: "POST", headers: getDuffelHeaders(),
    body: JSON.stringify({
      data: {
        rooms: 1,
        guests: Array.from({ length: Math.max(1, guests) }, () => ({ type: "adult" })),
        check_in_date: checkInDate, check_out_date: checkOutDate,
        location: { radius: 15, radius_unit: "km", geographic_coordinates: { latitude, longitude } },
      },
    }),
  });
  const json = await response.json();
  if (json.errors) throw new Error(json.errors[0]?.message || "Unknown Duffel error");

  return ((json.data?.results || []) as any[]).slice(0, 6).map((r) => {
    const acc = r.accommodation || {};
    return {
      id: r.id, name: acc.name || "Hotel", city: acc.location?.address?.city_name || "",
      starRating: acc.star_rating || 0,
      pricePerNight: r.cheapest_rate_total_amount || null,
      currency: r.cheapest_rate_currency || null,
      amenities: (acc.amenities || []).map((a: any) => a.description || a.type).filter(Boolean).slice(0, 4),
    };
  });
}
