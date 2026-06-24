import { ArrowLeft, Sparkles, Plane, Clock, Wallet } from "lucide-react";
import Link from "next/link";
import { decodeAnswers } from "@/lib/answerParams";
import FlightSearch from "@/components/FlightSearch";
import HotelSearch from "@/components/HotelSearch";
import AiItineraryPanel from "@/components/AiItineraryPanel";
import { getDestinationBySlug } from "@/lib/destinations";

// This page serves AI-discovered destinations that don't have a static
// page in our curated list. It receives all the details it needs via
// URL search params (destination name, IATA code, coordinates, and the
// visitor's planner answers for the itinerary panel).
export default function SearchPage({
  searchParams,
}: {
  searchParams: Record<string, string | string[] | undefined>;
}) {
  const name = typeof searchParams.destination === "string"
    ? searchParams.destination : "";
  const country = typeof searchParams.country === "string"
    ? searchParams.country : "";
  const iata = typeof searchParams.iata === "string"
    ? searchParams.iata.toUpperCase() : "";
  const lat = parseFloat(typeof searchParams.lat === "string" ? searchParams.lat : "0") || 0;
  const lng = parseFloat(typeof searchParams.lng === "string" ? searchParams.lng : "0") || 0;

  const plannerAnswers = decodeAnswers(searchParams);

  if (!name) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-12 text-center text-gray-500">
        <p>No destination specified.</p>
        <Link href="/" className="text-meadow underline mt-2 inline-block">
          Back to homepage
        </Link>
      </div>
    );
  }

  // Check if this destination also has a curated static page — if so, link
  // to that for richer content (highlights, tips etc.)
  const curatedSlug = name.toLowerCase().replace(/\s+/g, "-");
  const curatedDestination = getDestinationBySlug(curatedSlug);

  return (
    <div>
      {/* Banner */}
      <div className="bg-meadow h-32 sm:h-40 flex items-center justify-center px-4">
        <div className="text-center text-white">
          <div className="flex items-center gap-2 justify-center mb-1">
            <Sparkles size={16} className="text-white/70" aria-hidden="true" />
            <span className="text-xs text-white/70 uppercase tracking-wide">
              AI-recommended destination
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-medium">{name}</h1>
          {country && <p className="text-sm text-white/80 mt-1">{country}</p>}
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6">
        <div className="flex items-center gap-3 mb-6 flex-wrap">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 transition-colors"
          >
            <ArrowLeft size={14} aria-hidden="true" /> Back
          </Link>
          {iata && (
            <span className="inline-flex items-center gap-1 text-xs bg-gray-100 rounded-full px-2.5 py-1 text-gray-500">
              <Plane size={11} aria-hidden="true" /> Nearest airport: {iata}
            </span>
          )}
          {curatedDestination && (
            <Link
              href={`/destinations/${curatedDestination.slug}`}
              className="text-xs text-meadow underline"
            >
              View full destination page →
            </Link>
          )}
        </div>

        {/* AI itinerary */}
        <section className="mb-8">
          <AiItineraryPanel
            slug={curatedSlug}
            answers={plannerAnswers}
            destinationName={name}
            // For non-curated destinations we pass a custom override
            // so the panel can still generate an itinerary.
            customDestination={{ name, country, city: name, iata, lat, lng }}
          />
        </section>
      </div>

      {/* Search section */}
      <section className="bg-gray-50 border-t border-gray-100">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <h2 className="text-lg font-medium text-gray-900 mb-1">
            Search flights &amp; hotels
          </h2>
          <p className="text-sm text-gray-500 mb-6">
            Powered by Duffel — add your API key for live results.
          </p>

          <div className="bg-white border border-gray-200 rounded-2xl p-5 mb-4">
            <h3 className="text-sm font-medium text-gray-900 mb-3">Flights</h3>
            <FlightSearch destinationIata={iata || "XXX"} destinationName={name} />
          </div>

          {lat !== 0 && lng !== 0 && (
            <div className="bg-white border border-gray-200 rounded-2xl p-5">
              <h3 className="text-sm font-medium text-gray-900 mb-3">Hotels</h3>
              <HotelSearch
                destinationName={name}
                city={name}
                latitude={lat}
                longitude={lng}
              />
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
