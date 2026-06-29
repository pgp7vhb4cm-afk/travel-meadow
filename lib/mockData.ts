import type { FlightOffer, HotelOffer } from "./duffel";
import type { AiItinerary } from "./anthropic";
import type { Destination } from "./destinations";

const DURATION_DAYS: Record<string, number> = {
  "Long weekend (3–4 days)": 4, "One week": 7, "10–12 days": 11, "Two weeks": 14, "Three weeks or more": 21,
};
const STYLE_STOPS: Record<string, number> = {
  "One base, total relaxation": 1, "One base with day trips": 1, "Two or three stops": 2, "Full multi-stop tour": 3, "Cruise or river cruise": 3,
};

export function mockItinerary(destination: Destination, answers: Partial<Record<string, string[]>>): AiItinerary {
  const dayCount = DURATION_DAYS[answers.duration?.[0] || ""] || 7;
  const stopCount = Math.min(STYLE_STOPS[answers.style?.[0] || ""] || 1, Math.max(1, dayCount - 1));
  const nights = Math.max(stopCount, dayCount - 1);
  const base = Math.floor(nights / stopCount);
  const extra = nights % stopCount;
  const areaNames = stopCount === 1 ? [destination.city] : Array.from({ length: stopCount }, (_, i) => i === 0 ? destination.city : `${destination.name} area ${i + 1}`);
  const stops = areaNames.map((area, i) => ({
    stopNumber: i + 1, area, nights: base + (i < extra ? 1 : 0),
    whyStay: i === 0 ? `A central base for exploring ${destination.name}.` : `A change of scenery on the other side of ${destination.name}.`,
    accommodationOptions: [
      { name: `${area} Boutique Hotel`, type: "Boutique hotel", whyGoodFit: `Well-reviewed boutique option in ${area}.`, priceIndicator: "Mid-range" },
      { name: `${area} Resort`, type: "Resort", whyGoodFit: `Larger resort option in ${area}.`, priceIndicator: "Premium" },
      { name: `${area} Guesthouse`, type: "Guesthouse", whyGoodFit: `Budget-friendly guesthouse in ${area}.`, priceIndicator: "Budget" },
    ],
  }));
  const days = Array.from({ length: dayCount }, (_, i) => {
    const day = i + 1;
    if (day === 1) return { day, title: `Arrive in ${destination.city}`, description: `Settle in and ease into the trip with a relaxed first evening in ${destination.city}.` };
    if (day === dayCount) return { day, title: "Final morning & departure", description: `Last morning for any final sights before heading to the airport.` };
    const hl = destination.highlights[(day - 2) % Math.max(1, destination.highlights.length)];
    return { day, title: hl || `Day ${day} in ${destination.name}`, description: `Explore ${(hl || destination.name).toLowerCase()} at your own pace.` };
  });
  return {
    destinationSlug: destination.slug,
    summary: `A sample ${dayCount}-day outline for ${destination.name} across ${stopCount} stop${stopCount > 1 ? "s" : ""}. Add an Anthropic API key for a real web-researched itinerary.`,
    bestTimeToVisit: destination.meta.find((m) => m.icon === "calendar")?.label || "",
    stops, days, sources: [],
  };
}

export function mockFlights(origin: string, destination: string, departureDate: string, passengers: number): FlightOffer[] {
  return [
    { carrierName: "British Airways", carrierCode: "BA", depTime: "07:10", arrTime: "10:30", duration: "PT3H20M", stops: 0, price: 189 },
    { carrierName: "easyJet", carrierCode: "EZ", depTime: "06:20", arrTime: "09:55", duration: "PT3H35M", stops: 0, price: 142 },
    { carrierName: "Ryanair", carrierCode: "FR", depTime: "11:40", arrTime: "17:50", duration: "PT6H10M", stops: 1, price: 98 },
  ].map((s, i) => ({
    id: `mock-flight-${origin}-${destination}-${i}`,
    totalAmount: String(s.price * Math.max(1, passengers)),
    totalCurrency: "GBP", carrierName: s.carrierName, carrierCode: s.carrierCode,
    departingAt: `${departureDate}T${s.depTime}:00`, arrivingAt: `${departureDate}T${s.arrTime}:00`,
    duration: s.duration, stops: s.stops,
  }));
}

export function mockHotels(city: string): HotelOffer[] {
  return [
    { name: "Grand Meadow Hotel", stars: 5, price: 285, amenities: ["Sea view", "Pool", "Spa"] },
    { name: "Casa Belvedere", stars: 4, price: 168, amenities: ["Free WiFi", "Breakfast", "Terrace"] },
    { name: "Hotel La Perla", stars: 3, price: 94, amenities: ["Free WiFi", "Bar", "City centre"] },
  ].map((h, i) => ({
    id: `mock-hotel-${city}-${i}`, name: h.name, city,
    starRating: h.stars, pricePerNight: String(h.price), currency: "GBP", amenities: h.amenities,
  }));
}
