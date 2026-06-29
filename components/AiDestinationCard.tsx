"use client";

import { useState } from "react";
import { Plane, Clock, Wallet, Calendar, ChevronDown, ChevronUp, Search } from "lucide-react";
import type { AiDestinationSuggestion } from "@/lib/anthropic";
import { encodeAnswers } from "@/lib/answerParams";

const PRICE_COLOURS: Record<string, string> = {
  Budget: "bg-green-50 text-green-700 border-green-200",
  "Mid-range": "bg-blue-50 text-blue-700 border-blue-200",
  Premium: "bg-purple-50 text-purple-700 border-purple-200",
  Luxury: "bg-amber-50 text-amber-700 border-amber-200",
};

export default function AiDestinationCard({ destination, answers, rank }: { destination: AiDestinationSuggestion; answers: Record<string, string[] | undefined>; rank: number }) {
  const [expanded, setExpanded] = useState(rank === 0);
  const queryString = encodeAnswers(answers);
  const searchUrl = `/search?destination=${encodeURIComponent(destination.name)}&country=${encodeURIComponent(destination.country)}&iata=${destination.iata}&lat=${destination.lat}&lng=${destination.lng}&${queryString}`;
  const priceClass = PRICE_COLOURS[destination.priceIndicator] || "bg-gray-50 text-gray-600 border-gray-200";

  return (
    <div className="border border-gray-200 rounded-2xl overflow-hidden">
      <button type="button" onClick={() => setExpanded((e) => !e)} className="w-full text-left p-4 flex items-start gap-3 hover:bg-gray-50 transition-colors" aria-expanded={expanded}>
        <span className="text-2xl mt-0.5 flex-shrink-0" aria-hidden="true">{destination.emoji}</span>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="text-base font-medium text-gray-900">{destination.name}</h3>
            <span className="text-xs text-gray-400">{destination.country}</span>
            <span className={`text-xs border rounded-full px-2 py-0.5 ${priceClass}`}>{destination.priceIndicator}</span>
          </div>
          <p className="text-sm text-gray-600 mt-0.5">{destination.tagline}</p>
          <div className="flex flex-wrap gap-3 mt-1.5">
            {destination.flightTime && <span className="flex items-center gap-1 text-xs text-gray-400"><Plane size={11} aria-hidden="true" />{destination.flightTime}</span>}
            {destination.region && <span className="text-xs text-gray-400">{destination.region}</span>}
          </div>
        </div>
        <span className="text-gray-400 flex-shrink-0 mt-1">{expanded ? <ChevronUp size={16} aria-hidden="true" /> : <ChevronDown size={16} aria-hidden="true" />}</span>
      </button>

      {expanded && (
        <div className="px-4 pb-4 border-t border-gray-100 pt-3">
          <div className="bg-meadow-light border border-meadow/20 rounded-xl p-3 mb-3">
            <p className="text-sm text-meadow-dark leading-relaxed">{destination.whyMatch}</p>
          </div>
          <div className="flex flex-wrap gap-2 mb-3">
            {destination.bestTimeToVisit && <span className="inline-flex items-center gap-1.5 text-xs bg-gray-50 border border-gray-100 rounded-full px-2.5 py-1 text-gray-500"><Calendar size={11} aria-hidden="true" />{destination.bestTimeToVisit}</span>}
            {destination.flightTime && <span className="inline-flex items-center gap-1.5 text-xs bg-gray-50 border border-gray-100 rounded-full px-2.5 py-1 text-gray-500"><Clock size={11} aria-hidden="true" />{destination.flightTime}</span>}
            {destination.priceIndicator && <span className="inline-flex items-center gap-1.5 text-xs bg-gray-50 border border-gray-100 rounded-full px-2.5 py-1 text-gray-500"><Wallet size={11} aria-hidden="true" />{destination.priceIndicator}</span>}
          </div>
          {destination.highlights.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-4">
              {destination.highlights.map((h) => <span key={h} className="text-xs bg-gray-100 rounded-full px-2.5 py-1 text-gray-600">{h}</span>)}
            </div>
          )}
          <a href={searchUrl} className="inline-flex items-center gap-2 bg-meadow text-white text-sm px-4 py-2 rounded-md hover:bg-meadow-dark transition-colors">
            <Search size={14} aria-hidden="true" /> Search flights &amp; hotels
          </a>
        </div>
      )}
    </div>
  );
}
