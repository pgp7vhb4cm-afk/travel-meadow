"use client";

import { useState } from "react";
import { Search, Loader2, AlertCircle, Building2 } from "lucide-react";
import type { HotelOffer } from "@/lib/duffel";
import { ResultBadge } from "./FlightSearch";

function formatPrice(amount: string | null, currency: string | null): string {
  if (!amount) return "Price on request";
  const value = Number(amount);
  if (Number.isNaN(value)) return amount;
  try {
    return new Intl.NumberFormat("en-GB", {
      style: "currency",
      currency: currency || "GBP",
      maximumFractionDigits: 0,
    }).format(value);
  } catch {
    return `${currency || ""} ${amount}`;
  }
}

type ApiResponse = {
  source: "duffel" | "mock";
  hotels: HotelOffer[];
  warning?: string;
  error?: string;
};

export default function HotelSearch({
  destinationName,
  city,
  latitude,
  longitude,
}: {
  destinationName: string;
  city: string;
  latitude: number;
  longitude: number;
}) {
  const [checkIn, setCheckIn] = useState("2026-08-01");
  const [checkOut, setCheckOut] = useState("2026-08-15");
  const [guests, setGuests] = useState(2);

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ApiResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch("/api/hotels/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          latitude,
          longitude,
          city,
          checkInDate: checkIn,
          checkOutDate: checkOut,
          guests,
        }),
      });

      const data: ApiResponse = await response.json();
      if (!response.ok) {
        setError(data.error || "Something went wrong while searching.");
        return;
      }
      setResult(data);
    } catch {
      setError("Couldn't reach the server. Check your connection and try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <form onSubmit={handleSearch} className="grid gap-3 sm:grid-cols-4 mb-3">
        <Field label="Check-in">
          <input
            type="date"
            value={checkIn}
            onChange={(e) => setCheckIn(e.target.value)}
            className="input"
          />
        </Field>
        <Field label="Check-out">
          <input
            type="date"
            value={checkOut}
            onChange={(e) => setCheckOut(e.target.value)}
            className="input"
          />
        </Field>
        <Field label="Guests">
          <select
            value={guests}
            onChange={(e) => setGuests(Number(e.target.value))}
            className="input"
          >
            <option value={1}>1 guest</option>
            <option value={2}>2 guests</option>
            <option value={3}>3 guests</option>
            <option value={4}>4 guests</option>
          </select>
        </Field>

        <div className="flex items-end">
          <button
            type="submit"
            disabled={loading}
            className="inline-flex items-center gap-2 bg-meadow text-white text-sm px-4 py-2 rounded-md hover:bg-meadow-dark transition-colors disabled:opacity-60 w-full justify-center sm:w-auto"
          >
            {loading ? (
              <Loader2 size={16} className="animate-spin" aria-hidden="true" />
            ) : (
              <Search size={16} aria-hidden="true" />
            )}
            Search hotels in {destinationName}
          </button>
        </div>
      </form>

      {error && (
        <p className="text-sm text-red-600 flex items-center gap-1.5 mb-3">
          <AlertCircle size={14} aria-hidden="true" /> {error}
        </p>
      )}

      {result && (
        <div>
          <ResultBadge source={result.source} warning={result.warning} kind="hotel" />
          <div className="flex flex-col gap-2 mt-2">
            {result.hotels.map((hotel) => (
              <div
                key={hotel.id}
                className="border border-gray-200 rounded-xl p-3 flex items-center gap-4 flex-wrap"
              >
                <div className="w-14 h-14 rounded-lg bg-gray-50 flex items-center justify-center text-gray-400 flex-shrink-0">
                  <Building2 size={22} aria-hidden="true" />
                </div>
                <div className="flex-1 min-w-[140px]">
                  <div className="text-sm font-medium text-gray-900">{hotel.name}</div>
                  <div className="text-xs text-gray-400 mb-1">
                    {hotel.city || destinationName}
                  </div>
                  {hotel.starRating > 0 && (
                    <div className="text-xs text-amber-500">
                      {"★".repeat(Math.min(5, Math.round(hotel.starRating)))}
                    </div>
                  )}
                  {hotel.amenities.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-1">
                      {hotel.amenities.map((amenity) => (
                        <span
                          key={amenity}
                          className="text-xs bg-gray-50 border border-gray-100 rounded-full px-2 py-0.5 text-gray-500"
                        >
                          {amenity}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
                <div className="text-right flex-shrink-0">
                  <div className="text-lg font-medium text-gray-900">
                    {formatPrice(hotel.pricePerNight, hotel.currency)}
                  </div>
                  <div className="text-xs text-gray-400">per night</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="flex flex-col gap-1">
      <span className="text-xs font-medium uppercase tracking-wide text-gray-400">
        {label}
      </span>
      {children}
    </label>
  );
}
