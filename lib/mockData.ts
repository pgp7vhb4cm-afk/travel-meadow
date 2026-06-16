// Sample data shown when no Duffel API key is configured, or when a live
// request fails. This keeps the site fully usable out of the box, and
// makes it obvious (via the "source" field returned from the API routes)
// which results are real and which are samples.

import type { FlightOffer, HotelOffer } from "./duffel";
import type { AiItinerary } from "./anthropic";
import type { Destination } from "./destinations";

const DURATION_DAY_COUNTS: Record<string, number> = {
  "Long weekend (3–4 days)": 4,
  "One week": 7,
  "10–12 days": 11,
  "Two weeks": 14,
  "Three weeks or more": 21,
};

// How many stops a given "style" answer implies — mirrors the logic given
// to the AI prompt, so mock and real itineraries behave consistently.
const STYLE_STOP_COUNTS: Record<string, number> = {
  "One base, total relaxation": 1,
  "One base with day trips": 1,
  "Two or three stops": 2,
  "Full multi-stop tour": 3,
  "Cruise or river cruise": 3,
};

const SAMPLE_ACCOMMODATION_TYPES = ["Boutique hotel", "Resort", "Guesthouse"];
const SAMPLE_PRICE_INDICATORS = ["Mid-range", "Premium", "Budget"];

function buildSampleAccommodationOptions(areaName: string) {
  return SAMPLE_ACCOMMODATION_TYPES.map((type, i) => ({
    name: `${areaName} ${type}`,
    type,
    whyGoodFit: `A well-reviewed ${type.toLowerCase()} option in ${areaName} — add an Anthropic API key to get real, current named properties.`,
    priceIndicator: SAMPLE_PRICE_INDICATORS[i % SAMPLE_PRICE_INDICATORS.length],
  }));
}

export function mockItinerary(
  destination: Destination,
  answers: Partial<Record<string, string[]>>
): AiItinerary {
  const durationAnswer = answers.duration?.[0];
  const dayCount = (durationAnswer && DURATION_DAY_COUNTS[durationAnswer]) || 7;

  const styleAnswer = answers.style?.[0];
  const stopCount = Math.min(
    (styleAnswer && STYLE_STOP_COUNTS[styleAnswer]) || 1,
    Math.max(1, dayCount - 1)
  );

  // Split available nights (day count minus a notional travel day) evenly
  // across stops, in the same area order as the destination's highlights.
  const nightsAvailable = Math.max(stopCount, dayCount - 1);
  const baseNights = Math.floor(nightsAvailable / stopCount);
  const extraNights = nightsAvailable % stopCount;

  const stopAreaNames =
    stopCount === 1
      ? [destination.city]
      : Array.from({ length: stopCount }, (_, i) =>
          i === 0 ? destination.city : `${destination.name} area ${i + 1}`
        );

  const stops = stopAreaNames.map((areaName, i) => ({
    stopNumber: i + 1,
    area: areaName,
    nights: baseNights + (i < extraNights ? 1 : 0),
    whyStay:
      i === 0
        ? `A convenient, central base for exploring ${destination.name}.`
        : `A change of scenery to see another side of ${destination.name}.`,
    accommodationOptions: buildSampleAccommodationOptions(areaName),
  }));

  const days = Array.from({ length: dayCount }, (_, i) => {
    const day = i + 1;
    if (day === 1) {
      return {
        day,
        title: `Arrive in ${destination.city}`,
        description: `Settle in, get your bearings, and ease into the trip with a relaxed first evening near your accommodation in ${destination.city}.`,
      };
    }
    if (day === dayCount) {
      return {
        day,
        title: "Final morning & departure",
        description: `Use the morning for any last sights or a final relaxed meal before heading to the airport for your departure.`,
      };
    }
    const highlight = destination.highlights[(day - 2) % destination.highlights.length];
    return {
      day,
      title: highlight,
      description: `Spend the day exploring ${highlight.toLowerCase()} — one of ${destination.name}'s well-known highlights, with time built in to relax and explore at your own pace.`,
    };
  });

  return {
    destinationSlug: destination.slug,
    summary: `A sample ${dayCount}-day outline for ${destination.name} across ${stopCount} stop${stopCount > 1 ? "s" : ""}. This is placeholder content — add an Anthropic API key to generate a real, web-researched itinerary tailored to your answers.`,
    bestTimeToVisit: destination.meta.find((m) => m.icon === "calendar")?.label || "",
    stops,
    days,
    sources: [],
  };
}

export function mockFlights(
  origin: string,
  destination: string,
  departureDate: string,
  passengers: number
): FlightOffer[] {
  const samples = [
    {
      carrierName: "British Airways",
      carrierCode: "BA",
      depTime: "07:10",
      arrTime: "10:30",
      duration: "PT3H20M",
      stops: 0,
      pricePerPerson: 189,
    },
    {
      carrierName: "easyJet",
      carrierCode: "EZ",
      depTime: "06:20",
      arrTime: "09:55",
      duration: "PT3H35M",
      stops: 0,
      pricePerPerson: 142,
    },
    {
      carrierName: "Ryanair",
      carrierCode: "FR",
      depTime: "11:40",
      arrTime: "17:50",
      duration: "PT6H10M",
      stops: 1,
      pricePerPerson: 98,
    },
  ];

  return samples.map((sample, index) => ({
    id: `mock-flight-${origin}-${destination}-${index}`,
    totalAmount: String(sample.pricePerPerson * Math.max(1, passengers)),
    totalCurrency: "GBP",
    carrierName: sample.carrierName,
    carrierCode: sample.carrierCode,
    departingAt: `${departureDate}T${sample.depTime}:00`,
    arrivingAt: `${departureDate}T${sample.arrTime}:00`,
    duration: sample.duration,
    stops: sample.stops,
  }));
}

export function mockHotels(city: string): HotelOffer[] {
  const samples = [
    {
      name: "Grand Meadow Hotel",
      starRating: 5,
      pricePerNight: 285,
      amenities: ["Sea view", "Pool", "Spa"],
    },
    {
      name: "Casa Belvedere",
      starRating: 4,
      pricePerNight: 168,
      amenities: ["Free WiFi", "Breakfast", "Terrace"],
    },
    {
      name: "Hotel La Perla",
      starRating: 3,
      pricePerNight: 94,
      amenities: ["Free WiFi", "Bar", "City centre"],
    },
  ];

  return samples.map((sample, index) => ({
    id: `mock-hotel-${city}-${index}`,
    name: sample.name,
    city,
    starRating: sample.starRating,
    pricePerNight: String(sample.pricePerNight),
    currency: "GBP",
    amenities: sample.amenities,
  }));
}
