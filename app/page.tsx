import TripPlanner from "@/components/TripPlanner";
import DestinationCard from "@/components/DestinationCard";
import { DESTINATIONS } from "@/lib/destinations";

export default function HomePage() {
  return (
    <div>
      <section className="bg-meadow pb-16 pt-12 px-4">
        <div className="max-w-3xl mx-auto text-center text-white">
          <h1 className="text-3xl sm:text-4xl font-medium mb-2">
            Let&apos;s plan your perfect trip
          </h1>
          <p className="text-white/80 text-sm sm:text-base">
            Answer a few questions and we&apos;ll find holidays tailored just for you —
            like having your own travel expert.
          </p>
        </div>
      </section>

      <section className="px-4 -mt-10">
        <div className="max-w-3xl mx-auto">
          <TripPlanner />
        </div>
      </section>

      <section className="px-4 py-14">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-xl font-medium text-gray-900 mb-1">
            All destinations
          </h2>
          <p className="text-sm text-gray-500 mb-5">
            Browse every destination directly, or use the planner above for a
            tailored shortlist.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {DESTINATIONS.map((destination) => (
              <DestinationCard key={destination.slug} destination={destination} />
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
