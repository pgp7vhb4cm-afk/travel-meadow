// Sample data shown when no Duffel API key is configured, or when a live
// request fails. This keeps the site fully usable out of the box, and
// makes it obvious (via the "source" field returned from the API routes)
// which results are real and which are samples.

import type { FlightOffer, HotelOffer } from "./duffel";

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
