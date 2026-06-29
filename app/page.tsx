import TripPlanner from "@/components/TripPlanner";
import DestinationCard from "@/components/DestinationCard";
import { DESTINATIONS } from "@/lib/destinations";

export default function HomePage() {
  return (
    <div>
      <section className="bg-meadow pb-16 pt-12 px-4">
        <div className="max-w-3xl mx-auto text-center text-white">
          <h1 className="text-3xl sm:text-4xl font-medium mb-2">Let&apos;s plan your perfect trip</h1>
          <p className="text-white/80 text-sm sm:text-base">Answer a few questions and we&apos;ll search the world for holidays tailored just for you.</p>
        </div>
      </section>
      <section className="px-4 -mt-10">
        <div className="max-w-3xl mx-auto"><TripPlanner /></div>
      </section>
      <section className="px-4 py-14">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-xl font-medium text-gray-900 mb-1">Browse destinations</h2>
          <p className="text-sm text-gray-500 mb-5">Explore our curated picks directly, or use the planner above for AI-powered personalised suggestions.</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {DESTINATIONS.map((d) => <DestinationCard key={d.slug} destination={d} />)}
          </div>
        </div>
      </section>
    </div>
  );
}
