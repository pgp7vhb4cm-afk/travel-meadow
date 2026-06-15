import Link from "next/link";
import { Sun, Plane, Calendar, Wallet, ArrowRight } from "lucide-react";
import type { Destination, MetaIcon } from "@/lib/destinations";

const ICONS: Record<MetaIcon, typeof Sun> = {
  sun: Sun,
  plane: Plane,
  calendar: Calendar,
  wallet: Wallet,
};

export default function DestinationCard({
  destination,
}: {
  destination: Destination;
}) {
  return (
    <Link
      href={`/destinations/${destination.slug}`}
      className="block border border-gray-200 rounded-xl p-4 hover:border-meadow transition-colors group h-full"
    >
      <div className="flex items-center justify-between mb-1 gap-2">
        <span className="text-base font-medium text-gray-900">
          {destination.emoji} {destination.name}
        </span>
      </div>
      <p className="text-xs text-gray-400 mb-2">{destination.country}</p>
      <p className="text-sm text-gray-500 mb-3 leading-relaxed">
        {destination.tagline}
      </p>
      <div className="flex flex-wrap gap-1.5 mb-3">
        {destination.meta.slice(0, 2).map((item) => {
          const Icon = ICONS[item.icon];
          return (
            <span
              key={item.label}
              className="inline-flex items-center gap-1 text-xs bg-gray-50 border border-gray-100 rounded-full px-2 py-1 text-gray-500"
            >
              <Icon size={12} aria-hidden="true" />
              {item.label}
            </span>
          );
        })}
      </div>
      <span className="inline-flex items-center gap-1 text-sm text-meadow font-medium group-hover:gap-2 transition-all">
        Explore <ArrowRight size={14} aria-hidden="true" />
      </span>
    </Link>
  );
}
