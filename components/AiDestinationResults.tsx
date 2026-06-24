"use client";

import { useState, useCallback } from "react";
import { Loader2, AlertCircle, RotateCcw } from "lucide-react";
import type { AiDestinationSuggestion } from "@/lib/anthropic";
import AiDestinationCard from "./AiDestinationCard";

type StreamEvent =
  | { type: "progress"; message: string }
  | { type: "result"; destinations: AiDestinationSuggestion[]; source: "ai" | "mock" }
  | { type: "error"; message: string };

type Status = "idle" | "loading" | "done" | "error";

export default function AiDestinationResults({
  answers,
  onReset,
}: {
  answers: Record<string, string[] | undefined>;
  onReset: () => void;
}) {
  const [status, setStatus] = useState<Status>("idle");
  const [progressMessage, setProgressMessage] = useState("");
  const [destinations, setDestinations] = useState<AiDestinationSuggestion[]>([]);
  const [source, setSource] = useState<"ai" | "mock">("mock");
  const [errorMessage, setErrorMessage] = useState("");

  const search = useCallback(async () => {
    setStatus("loading");
    setProgressMessage("Starting your search...");
    setDestinations([]);
    setErrorMessage("");

    try {
      const response = await fetch("/api/destinations/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answers }),
      });

      if (!response.ok || !response.body) {
        throw new Error("Search failed — please try again.");
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() ?? "";

        for (const line of lines) {
          if (!line.trim()) continue;
          try {
            const event: StreamEvent = JSON.parse(line);
            if (event.type === "progress") {
              setProgressMessage(event.message);
            } else if (event.type === "result") {
              setDestinations(event.destinations);
              setSource(event.source);
              setStatus("done");
            } else if (event.type === "error") {
              setErrorMessage(event.message);
              setStatus("error");
            }
          } catch {
            // Ignore malformed lines.
          }
        }
      }

      // Catch case where stream ended without a result event.
      setStatus((s) => (s === "loading" ? "error" : s));
      if (status === "loading") {
        setErrorMessage("Search ended without results — please try again.");
      }
    } catch (err: any) {
      setErrorMessage(err?.message || "Something went wrong. Please try again.");
      setStatus("error");
    }
  }, [answers]);

  // Auto-start search on first render.
  const [started, setStarted] = useState(false);
  if (!started) {
    setStarted(true);
    search();
  }

  return (
    <div>
      {/* Source badge */}
      {status === "done" && (
        <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
          <div>
            <h2 className="text-base font-medium text-gray-900">
              {source === "ai"
                ? "Your personalised matches"
                : "Sample matches — add an Anthropic API key for AI-powered search"}
            </h2>
            <p className="text-xs text-gray-400 mt-0.5">
              {source === "ai"
                ? "Researched live across the web based on your answers"
                : "Drawn from our curated destination list"}
            </p>
          </div>
          <div className="flex items-center gap-2">
            {source === "ai" && (
              <span className="text-xs bg-meadow-light text-meadow-dark border border-meadow/30 rounded-full px-2.5 py-1">
                AI-researched
              </span>
            )}
            <button
              onClick={() => { search(); }}
              className="inline-flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-800 transition-colors border border-gray-200 rounded-full px-3 py-1"
            >
              <RotateCcw size={11} aria-hidden="true" /> Search again
            </button>
          </div>
        </div>
      )}

      {/* Loading state with live progress */}
      {status === "loading" && (
        <div className="bg-meadow-light border border-meadow/20 rounded-2xl p-6 text-center">
          <Loader2
            size={24}
            className="animate-spin text-meadow mx-auto mb-3"
            aria-hidden="true"
          />
          <p className="text-sm font-medium text-meadow-dark mb-1">
            {progressMessage}
          </p>
          <p className="text-xs text-meadow-dark/60">
            Searching destinations worldwide — this takes about 10–20 seconds
          </p>
          {/* Animated progress dots */}
          <div className="flex justify-center gap-1.5 mt-4">
            {[0, 1, 2].map((i) => (
              <span
                key={i}
                className="w-1.5 h-1.5 rounded-full bg-meadow/40 animate-pulse"
                style={{ animationDelay: `${i * 200}ms` }}
              />
            ))}
          </div>
        </div>
      )}

      {/* Error state */}
      {status === "error" && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-5">
          <p className="text-sm text-red-700 flex items-start gap-1.5 mb-3">
            <AlertCircle size={14} className="mt-0.5 flex-shrink-0" aria-hidden="true" />
            {errorMessage || "Something went wrong. Please try again."}
          </p>
          <button
            onClick={search}
            className="text-sm text-meadow hover:text-meadow-dark underline"
          >
            Try again
          </button>
        </div>
      )}

      {/* Results */}
      {status === "done" && destinations.length > 0 && (
        <div className="flex flex-col gap-3">
          {destinations.map((dest, i) => (
            <AiDestinationCard
              key={`${dest.name}-${i}`}
              destination={dest}
              answers={answers}
              rank={i}
            />
          ))}
        </div>
      )}

      {/* Start again link */}
      {(status === "done" || status === "error") && (
        <button
          onClick={onReset}
          className="inline-flex items-center gap-1.5 text-sm text-gray-400 hover:text-gray-700 transition-colors mt-4"
        >
          ← Change my answers
        </button>
      )}
    </div>
  );
}
