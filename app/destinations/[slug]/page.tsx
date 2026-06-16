import { notFound } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Sun,
  Plane,
  Calendar,
  Wallet,
  Sparkles,
  Star,
  Lightbulb,
  Check,
} from "lucide-react";
import { DESTINATIONS, getDestinationBySlug, type MetaIcon } from "@/lib/destinations";
import { decodeAnswers } from "@/lib/answerParams";
import FlightSearch from "@/components/FlightSearch";
import HotelSearch from "@/components/HotelSearch";
import AiItineraryPanel from "@/components/AiItineraryPanel";

const ICONS: Record<MetaIcon, typeof Sun> = {
  sun: Sun,
  plane: Plane,
  calendar: Calendar,
  wallet: Wallet,
};

export function generateStaticParams() {
  return DESTINATIONS.map((destination) => ({ slug: destination.slug }));
}

export default function DestinationPage({
  params,
  searchParams,
}: {
  params: { slug: string };
  searchParams: Record<string, string | string[] | undefined>;
}) {
  const destination = getDestinationBySlug(params.slug);
  if (!destination) notFound();

  const plannerAnswers = decodeAnswers(searchParams);

  return (
    <div>
      {/* Banner */}
      <div
        className="relative h-40 sm:h-52 flex items-center justify-center overflow-hidden"
        style={{ backgroundColor: destination.bannerColor }}
      >
        <span
          className="absolute text-[6rem] sm:text-[8rem] opacity-15 right-4 -bottom-6 leading-none select-none"
          aria-hidden="true"
        >
          {destination.emoji}
        </span>
        <div className="relative text-center text-white px-4">
          <h1 className="text-2xl sm:text-3xl font-medium mb-1">{destination.name}</h1>
          <p className="text-sm text-white/85">
            {destination.country} · {destination.tagline}
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 transition-colors mb-4"
        >
          <ArrowLeft size={14} aria-hidden="true" /> Back to all destinations
        </Link>

        {/* Meta pills */}
        <div className="flex flex-wrap gap-2 mb-8">
          {destination.meta.map((item) => {
            const Icon = ICONS[item.icon];
            return (
              <span
                key={item.label}
                className="inline-flex items-center gap-1.5 text-xs bg-gray-50 border border-gray-200 rounded-full px-3 py-1.5 text-gray-500"
              >
                <Icon size={13} aria-hidden="true" />
                {item.label}
              </span>
            );
          })}
        </div>

        {/* Why this works */}
        <section className="mb-8">
          <h2 className="flex items-center gap-2 text-sm font-medium text-gray-900 mb-2">
            <Sparkles size={16} className="text-meadow" aria-hidden="true" />
            Why visit {destination.name}
          </h2>
          <div className="bg-meadow-light border border-meadow/20 rounded-xl p-4 text-sm text-meadow-dark leading-relaxed">
            {destination.why}
          </div>
        </section>

        {/* AI-powered tailored itinerary */}
        <section className="mb-8">
          <AiItineraryPanel
            slug={destination.slug}
            answers={plannerAnswers}
            destinationName={destination.name}
          />
        </section>

        {/* Highlights */}
        <section className="mb-8">
          <h2 className="flex items-center gap-2 text-sm font-medium text-gray-900 mb-3">
            <Star size={16} className="text-meadow" aria-hidden="true" />
            Highlights
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {destination.highlights.map((highlight) => (
              <div
                key={highlight}
                className="border border-gray-200 rounded-xl p-3 text-center text-sm text-gray-600"
              >
                {highlight}
              </div>
            ))}
          </div>
        </section>

        {/* Tips */}
        <section className="mb-10">
          <h2 className="flex items-center gap-2 text-sm font-medium text-gray-900 mb-3">
            <Lightbulb size={16} className="text-meadow" aria-hidden="true" />
            Tips &amp; best time to visit
          </h2>
          <ul className="flex flex-col gap-2">
            {destination.tips.map((tip) => (
              <li key={tip} className="flex items-start gap-2 text-sm text-gray-600">
                <Check size={15} className="text-meadow mt-0.5 flex-shrink-0" aria-hidden="true" />
                {tip}
              </li>
            ))}
          </ul>
        </section>
      </div>

      {/* Search */}
      <section className="bg-gray-50 border-t border-gray-100">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <h2 className="text-lg font-medium text-gray-900 mb-1">
            Search flights &amp; hotels
          </h2>
          <p className="text-sm text-gray-500 mb-6">
            Powered by the Duffel API. Without a Duffel key configured, sample
            results are shown so the site stays fully usable.
          </p>

          <div className="bg-white border border-gray-200 rounded-2xl p-5 mb-4">
            <h3 className="text-sm font-medium text-gray-900 mb-3">Flights</h3>
            <FlightSearch destinationIata={destination.iata} destinationName={destination.name} />
          </div>

          <div className="bg-white border border-gray-200 rounded-2xl p-5">
            <h3 className="text-sm font-medium text-gray-900 mb-3">Hotels</h3>
            <HotelSearch
              destinationName={destination.name}
              city={destination.city}
              latitude={destination.lat}
              longitude={destination.lng}
            />
          </div>
        </div>
      </section>
    </div>
  );
}
