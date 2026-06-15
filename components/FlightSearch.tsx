"use client";

import { useState } from "react";
import { Search, Loader2, AlertCircle, PlaneTakeoff } from "lucide-react";
import type { FlightOffer } from "@/lib/duffel";

function formatDuration(iso: string): string {
  const match = iso.match(/PT(?:(\d+)H)?(?:(\d+)M)?/);
  if (!match) return iso;
  const hours = match[1] ? `${match[1]}h` : "";
  const minutes = match[2] ? `${match[2]}m` : "";
  return [hours, minutes].filter(Boolean).join(" ") || "—";
}

function formatTime(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
}

function formatPrice(amount: string, currency: string): string {
  const value = Number(amount);
  if (Number.isNaN(value)) return amount;
  try {
    return new Intl.NumberFormat("en-GB", {
      style: "currency",
      currency,
      maximumFractionDigits: 0,
    }).format(value);
  } catch {
    return `${currency} ${amount}`;
  }
}

type ApiResponse = {
  source: "duffel" | "mock";
  offers: FlightOffer[];
  warning?: string;
  error?: string;
};

export default function FlightSearch({
  destinationIata,
  destinationName,
}: {
  destinationIata: string;
  destinationName: string;
}) {
  const [origin, setOrigin] = useState("LHR");
  const [destination, setDestination] = useState(destinationIata);
  const [departureDate, setDepartureDate] = useState("2026-08-01");
  const [returnDate, setReturnDate] = useState("2026-08-15");
  const [passengers, setPassengers] = useState(2);

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ApiResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch("/api/flights/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          origin: origin.trim().toUpperCase(),
          destination: destination.trim().toUpperCase(),
          departureDate,
          returnDate: returnDate || undefined,
          passengers,
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
      <form onSubmit={handleSearch} className="grid gap-3 sm:grid-cols-5 mb-3">
        <Field label="From">
          <input
            value={origin}
            onChange={(e) => setOrigin(e.target.value)}
            className="input"
            maxLength={3}
          />
        </Field>
        <Field label="To (IATA)">
          <input
            value={destination}
            onChange={(e) => setDestination(e.target.value)}
            className="input"
            maxLength={3}
          />
        </Field>
        <Field label="Depart">
          <input
            type="date"
            value={departureDate}
            onChange={(e) => setDepartureDate(e.target.value)}
            className="input"
          />
        </Field>
        <Field label="Return">
          <input
            type="date"
            value={returnDate}
            onChange={(e) => setReturnDate(e.target.value)}
            className="input"
          />
        </Field>
        <Field label="Passengers">
          <select
            value={passengers}
            onChange={(e) => setPassengers(Number(e.target.value))}
            className="input"
          >
            <option value={1}>1 adult</option>
            <option value={2}>2 adults</option>
            <option value={3}>3 adults</option>
            <option value={4}>4 adults</option>
          </select>
        </Field>

        <div className="sm:col-span-5">
          <button
            type="submit"
            disabled={loading}
            className="inline-flex items-center gap-2 bg-meadow text-white text-sm px-4 py-2 rounded-md hover:bg-meadow-dark transition-colors disabled:opacity-60"
          >
            {loading ? (
              <Loader2 size={16} className="animate-spin" aria-hidden="true" />
            ) : (
              <Search size={16} aria-hidden="true" />
            )}
            Search flights to {destinationName}
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
          <ResultBadge source={result.source} warning={result.warning} kind="flight" />
          <div className="flex flex-col gap-2 mt-2">
            {result.offers.map((offer) => (
              <div
                key={offer.id}
                className="border border-gray-200 rounded-xl p-3 flex items-center gap-4 flex-wrap"
              >
                <div className="w-10 h-10 rounded-lg bg-gray-50 flex items-center justify-center text-xs font-medium text-gray-500 flex-shrink-0">
                  {offer.carrierCode || <PlaneTakeoff size={16} />}
                </div>
                <div className="flex-1 min-w-[160px]">
                  <div className="flex items-center gap-3 mb-0.5">
                    <span className="text-base font-medium text-gray-900">
                      {formatTime(offer.departingAt)}
                    </span>
                    <span className="flex-1 h-px bg-gray-200" />
                    <span className="text-xs text-gray-400">
                      {formatDuration(offer.duration)}
                    </span>
                    <span className="flex-1 h-px bg-gray-200" />
                    <span className="text-base font-medium text-gray-900">
                      {formatTime(offer.arrivingAt)}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500">
                    <span className={offer.stops === 0 ? "text-meadow" : "text-amber-600"}>
                      {offer.stops === 0 ? "Direct" : `${offer.stops} stop${offer.stops > 1 ? "s" : ""}`}
                    </span>{" "}
                    · {offer.carrierName}
                  </p>
                </div>
                <div className="text-right flex-shrink-0">
                  <div className="text-lg font-medium text-gray-900">
                    {formatPrice(offer.totalAmount, offer.totalCurrency)}
                  </div>
                  <div className="text-xs text-gray-400">total · {passengers} pax</div>
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

export function ResultBadge({
  source,
  warning,
  kind,
}: {
  source: "duffel" | "mock";
  warning?: string;
  kind: "flight" | "hotel";
}) {
  return (
    <div className="flex flex-col gap-1">
      {source === "duffel" ? (
        <span className="inline-flex items-center gap-1.5 text-xs bg-meadow-light text-meadow-dark border border-meadow/30 rounded-full px-2.5 py-1 self-start">
          Live Duffel data
        </span>
      ) : (
        <span className="inline-flex items-center gap-1.5 text-xs bg-gray-100 text-gray-500 border border-gray-200 rounded-full px-2.5 py-1 self-start">
          Sample data — add a Duffel API key for live {kind === "flight" ? "flights" : "hotels"}
        </span>
      )}
      {warning && <p className="text-xs text-gray-400">{warning}</p>}
    </div>
  );
}
