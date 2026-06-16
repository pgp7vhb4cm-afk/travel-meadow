"use client";

import { useState } from "react";
import { Search, Loader2, AlertCircle, PlaneTakeoff, Plus, Minus, X } from "lucide-react";
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
  const [adults, setAdults] = useState(2);
  // Each entry is that child's age in years (0-17). Duffel needs an exact
  // age per child to return correctly priced child/infant fares.
  const [childAges, setChildAges] = useState<number[]>([]);

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ApiResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const totalPassengers = adults + childAges.length;

  function addChild() {
    setChildAges((prev) => [...prev, 5]);
  }

  function removeChild(index: number) {
    setChildAges((prev) => prev.filter((_, i) => i !== index));
  }

  function updateChildAge(index: number, age: number) {
    setChildAges((prev) => prev.map((a, i) => (i === index ? age : a)));
  }

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
          adults,
          childAges,
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
      <form onSubmit={handleSearch} className="mb-3">
        <div className="grid gap-3 sm:grid-cols-4 mb-3">
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
        </div>

        {/* Passengers: adults + children with per-child age */}
        <div className="border border-gray-200 rounded-lg p-3 mb-3">
          <div className="flex items-center justify-between gap-3 flex-wrap mb-2">
            <span className="text-sm text-gray-700">Adults</span>
            <Stepper
              value={adults}
              onChange={setAdults}
              min={1}
              max={9}
              label="adults"
            />
          </div>

          <div className="flex items-center justify-between gap-3 flex-wrap">
            <div>
              <span className="text-sm text-gray-700">Children</span>
              <p className="text-xs text-gray-400">Under 18 — age needed for accurate fares</p>
            </div>
            <button
              type="button"
              onClick={addChild}
              disabled={childAges.length >= 8}
              className="inline-flex items-center gap-1 text-xs text-meadow hover:text-meadow-dark transition-colors disabled:text-gray-300"
            >
              <Plus size={14} aria-hidden="true" /> Add child
            </button>
          </div>

          {childAges.length > 0 && (
            <div className="flex flex-col gap-2 mt-3">
              {childAges.map((age, index) => (
                <div key={index} className="flex items-center gap-2 bg-gray-50 rounded-md p-2">
                  <span className="text-xs text-gray-500 w-16">Child {index + 1}</span>
                  <label className="flex items-center gap-1.5 flex-1">
                    <span className="text-xs text-gray-400">Age</span>
                    <select
                      value={age}
                      onChange={(e) => updateChildAge(index, Number(e.target.value))}
                      className="input h-8 text-xs flex-1"
                    >
                      {Array.from({ length: 18 }, (_, i) => i).map((yearAge) => (
                        <option key={yearAge} value={yearAge}>
                          {yearAge === 0 ? "Under 1" : `${yearAge} ${yearAge === 1 ? "year" : "years"}`}
                        </option>
                      ))}
                    </select>
                  </label>
                  <button
                    type="button"
                    onClick={() => removeChild(index)}
                    aria-label={`Remove child ${index + 1}`}
                    className="text-gray-400 hover:text-red-500 transition-colors"
                  >
                    <X size={14} aria-hidden="true" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

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
                  <div className="text-xs text-gray-400">total · {totalPassengers} pax</div>
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

function Stepper({
  value,
  onChange,
  min,
  max,
  label,
}: {
  value: number;
  onChange: (value: number) => void;
  min: number;
  max: number;
  label: string;
}) {
  return (
    <div className="flex items-center gap-3">
      <button
        type="button"
        onClick={() => onChange(Math.max(min, value - 1))}
        disabled={value <= min}
        aria-label={`Decrease ${label}`}
        className="w-7 h-7 rounded-full border border-gray-300 flex items-center justify-center text-gray-500 hover:border-meadow hover:text-meadow transition-colors disabled:opacity-30"
      >
        <Minus size={13} aria-hidden="true" />
      </button>
      <span className="text-sm text-gray-900 w-4 text-center">{value}</span>
      <button
        type="button"
        onClick={() => onChange(Math.min(max, value + 1))}
        disabled={value >= max}
        aria-label={`Increase ${label}`}
        className="w-7 h-7 rounded-full border border-gray-300 flex items-center justify-center text-gray-500 hover:border-meadow hover:text-meadow transition-colors disabled:opacity-30"
      >
        <Plus size={13} aria-hidden="true" />
      </button>
    </div>
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
