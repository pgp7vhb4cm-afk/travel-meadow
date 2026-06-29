"use client";

import { useEffect, useState } from "react";
import { Sparkles, Loader2, AlertCircle, MapPin, CalendarDays, ExternalLink } from "lucide-react";
import type { AiItinerary } from "@/lib/anthropic";

type ApiResponse = { source: "ai" | "mock"; itinerary: AiItinerary; warning?: string; error?: string };

const LOADING_MESSAGES = [
  "Researching current recommendations...",
  "Checking what's genuinely worth your time...",
  "Building out a day-by-day plan...",
  "Cross-checking the best areas to stay...",
];

type CustomDestination = { name: string; country: string; city: string; iata: string; lat: number; lng: number };

export default function AiItineraryPanel({ slug, answers, destinationName, customDestination }: { slug: string; answers: Record<string, string[]>; destinationName: string; customDestination?: CustomDestination }) {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ApiResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [msgIndex, setMsgIndex] = useState(0);

  useEffect(() => {
    if (!loading) return;
    const t = setInterval(() => setMsgIndex((i) => (i + 1) % LOADING_MESSAGES.length), 2200);
    return () => clearInterval(t);
  }, [loading]);

  async function generate() {
    setLoading(true); setError(null); setResult(null); setMsgIndex(0);
    try {
      const res = await fetch("/api/itinerary", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ slug, answers, customDestination }) });
      const data: ApiResponse = await res.json();
      if (!res.ok) { setError(data.error || "Something went wrong."); return; }
      setResult(data);
    } catch { setError("Couldn't reach the server."); } finally { setLoading(false); }
  }

  if (!result && !loading) {
    return (
      <div className="bg-meadow-light border border-meadow/20 rounded-2xl p-5 flex flex-col sm:flex-row items-start sm:items-center gap-4 justify-between">
        <div>
          <h3 className="flex items-center gap-2 text-sm font-medium text-meadow-dark mb-1"><Sparkles size={16} aria-hidden="true" />Build me a tailored itinerary</h3>
          <p className="text-sm text-meadow-dark/80">We&apos;ll research current recommendations for {destinationName} and build a day-by-day plan based on your answers.</p>
        </div>
        <button onClick={generate} className="inline-flex items-center gap-2 bg-meadow text-white text-sm px-4 py-2.5 rounded-md hover:bg-meadow-dark transition-colors whitespace-nowrap"><Sparkles size={16} aria-hidden="true" />Generate itinerary</button>
      </div>
    );
  }
  if (loading) {
    return (
      <div className="bg-meadow-light border border-meadow/20 rounded-2xl p-6 text-center">
        <Loader2 size={24} className="animate-spin text-meadow mx-auto mb-3" aria-hidden="true" />
        <p className="text-sm text-meadow-dark">{LOADING_MESSAGES[msgIndex]}</p>
      </div>
    );
  }
  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-2xl p-5">
        <p className="text-sm text-red-700 flex items-center gap-1.5 mb-3"><AlertCircle size={14} aria-hidden="true" />{error}</p>
        <button onClick={generate} className="text-sm text-meadow underline">Try again</button>
      </div>
    );
  }
  if (!result) return null;

  const { itinerary, source, warning } = result;
  return (
    <div className="border border-gray-200 rounded-2xl p-5 sm:p-6">
      <div className="flex items-center justify-between gap-2 mb-3 flex-wrap">
        <h3 className="flex items-center gap-2 text-base font-medium text-gray-900"><Sparkles size={17} className="text-meadow" aria-hidden="true" />Your tailored itinerary</h3>
        {source === "ai"
          ? <span className="text-xs bg-meadow-light text-meadow-dark border border-meadow/30 rounded-full px-2.5 py-1">AI-researched, web-grounded</span>
          : <span className="text-xs bg-gray-100 text-gray-500 border border-gray-200 rounded-full px-2.5 py-1">Sample — add Anthropic API key for real itinerary</span>}
      </div>
      {warning && <p className="text-xs text-gray-400 mb-3">{warning}</p>}
      <p className="text-sm text-gray-600 leading-relaxed mb-4">{itinerary.summary}</p>
      {itinerary.bestTimeToVisit && <p className="text-sm text-gray-500 mb-4"><span className="font-medium text-gray-700">Best time: </span>{itinerary.bestTimeToVisit}</p>}

      {itinerary.stops.length > 0 && (
        <div className="mb-5">
          <h4 className="flex items-center gap-1.5 text-sm font-medium text-gray-900 mb-2"><MapPin size={14} className="text-meadow" aria-hidden="true" />{itinerary.stops.length > 1 ? `Where to stay — ${itinerary.stops.length} stops` : "Where to stay"}</h4>
          <div className="flex flex-col gap-3">
            {itinerary.stops.map((stop) => (
              <div key={stop.stopNumber} className="border border-gray-100 bg-gray-50 rounded-lg p-3">
                <div className="flex items-center justify-between gap-2 mb-1 flex-wrap">
                  <p className="text-sm font-medium text-gray-800">{itinerary.stops.length > 1 ? `Stop ${stop.stopNumber}: ` : ""}{stop.area}</p>
                  <span className="text-xs text-gray-400">{stop.nights} night{stop.nights !== 1 ? "s" : ""}</span>
                </div>
                <p className="text-xs text-gray-500 mb-2">{stop.whyStay}</p>
                {stop.accommodationOptions.length > 0 && (
                  <div className="flex flex-col gap-1.5">
                    {stop.accommodationOptions.map((opt) => (
                      <div key={opt.name} className="bg-white border border-gray-100 rounded-md p-2 flex items-start justify-between gap-2">
                        <div><p className="text-xs font-medium text-gray-800">{opt.name}</p><p className="text-xs text-gray-400">{opt.type}</p><p className="text-xs text-gray-500 mt-0.5">{opt.whyGoodFit}</p></div>
                        <span className="text-xs bg-meadow-light text-meadow-dark rounded-full px-2 py-0.5 whitespace-nowrap">{opt.priceIndicator}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {itinerary.days.length > 0 && (
        <div className="mb-5">
          <h4 className="flex items-center gap-1.5 text-sm font-medium text-gray-900 mb-2"><CalendarDays size={14} className="text-meadow" aria-hidden="true" />Day by day</h4>
          <div className="flex flex-col gap-2">
            {itinerary.days.map((day) => (
              <div key={day.day} className="flex gap-3 border-l-2 border-meadow/30 pl-3 py-0.5">
                <div className="text-xs font-medium text-meadow whitespace-nowrap pt-0.5">Day {day.day}</div>
                <div><p className="text-sm font-medium text-gray-800">{day.title}</p><p className="text-xs text-gray-500 mt-0.5 leading-relaxed">{day.description}</p></div>
              </div>
            ))}
          </div>
        </div>
      )}

      {itinerary.sources.length > 0 && (
        <div>
          <h4 className="text-xs font-medium uppercase tracking-wide text-gray-400 mb-2">Sources</h4>
          <div className="flex flex-col gap-1">
            {itinerary.sources.map((src) => (
              <a key={src.url} href={src.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-xs text-gray-500 hover:text-meadow transition-colors">
                <ExternalLink size={12} aria-hidden="true" />{src.title}
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
