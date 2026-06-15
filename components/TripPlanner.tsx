"use client";

import { useState } from "react";
import { ArrowLeft, ArrowRight, Sparkles, RotateCcw, Check } from "lucide-react";
import { matchDestinations, type AnswerKey } from "@/lib/destinations";
import DestinationCard from "./DestinationCard";

type PlannerStep = {
  id: AnswerKey;
  label: string;
  title: string;
  sub: string;
  multi?: boolean;
  options: string[];
};

const STEPS: PlannerStep[] = [
  {
    id: "region",
    label: "Destination",
    title: "Where are you thinking of going?",
    sub: "Pick a region, or tell us you're open to ideas — we love a blank canvas.",
    options: [
      "Open to suggestions",
      "Europe",
      "UK & Ireland",
      "Caribbean & Mexico",
      "North America",
      "South America",
      "Africa",
      "Middle East",
      "South & Southeast Asia",
      "East Asia",
      "Australia & Pacific",
      "Indian Ocean islands",
    ],
  },
  {
    id: "party",
    label: "Travellers",
    title: "Who's travelling with you?",
    sub: "This helps us pick the right accommodation style and activities.",
    options: [
      "Solo adventurer",
      "Couple",
      "Family with young children",
      "Family with teens",
      "Group of friends",
      "Multi-generational family",
    ],
  },
  {
    id: "interest",
    label: "Interests",
    title: "What does your ideal trip look like?",
    sub: "Pick as many as you like — we'll find trips that blend them.",
    multi: true,
    options: [
      "City sights & culture",
      "Natural beauty",
      "Beach & coast",
      "Relaxation & wellness",
      "Wildlife & safari",
      "Food & drink",
      "Adventure & activities",
      "History & heritage",
    ],
  },
  {
    id: "weather",
    label: "Weather",
    title: "What's your ideal weather?",
    sub: "We'll lean towards destinations that fit, in season.",
    options: [
      "Hot and sunny",
      "Warm with a breeze",
      "Mild and dry",
      "Snow and winter magic",
      "Weather doesn't matter",
    ],
  },
  {
    id: "duration",
    label: "Duration",
    title: "How long is your holiday?",
    sub: "Including travel days.",
    options: [
      "Long weekend (3–4 days)",
      "One week",
      "10–12 days",
      "Two weeks",
      "Three weeks or more",
    ],
  },
  {
    id: "travelTime",
    label: "Journey",
    title: "How long are you happy travelling?",
    sub: "Total journey time each way, door to destination.",
    options: [
      "No flights — UK only",
      "Short-haul (up to 3 hours)",
      "Medium-haul (3–6 hours)",
      "Long-haul (6–12 hours)",
      "Anywhere",
    ],
  },
  {
    id: "style",
    label: "Trip style",
    title: "How do you like to structure your trip?",
    sub: "One place to really sink into, or a trip that covers more ground?",
    options: [
      "One base, total relaxation",
      "One base with day trips",
      "Two or three stops",
      "Full multi-stop tour",
      "Cruise or river cruise",
    ],
  },
  {
    id: "budget",
    label: "Budget",
    title: "What's your rough budget per person?",
    sub: "Including flights and accommodation.",
    options: [
      "Budget (under £1,000)",
      "Mid-range (£1,000–£2,500)",
      "Premium (£2,500–£5,000)",
      "Luxury (£5,000+)",
      "Flexible — best value",
    ],
  },
];

export default function TripPlanner() {
  const [stepIndex, setStepIndex] = useState(0);
  const [answers, setAnswers] = useState<Partial<Record<AnswerKey, string[]>>>({});
  const [showResults, setShowResults] = useState(false);

  const step = STEPS[stepIndex];
  const selected = answers[step.id] || [];
  const canProceed = selected.length > 0;
  const isLastStep = stepIndex === STEPS.length - 1;

  function toggleOption(option: string) {
    setAnswers((prev) => {
      const current = prev[step.id] || [];
      let next: string[];
      if (step.multi) {
        next = current.includes(option)
          ? current.filter((value) => value !== option)
          : [...current, option];
      } else {
        next = [option];
      }
      return { ...prev, [step.id]: next };
    });
  }

  function goNext() {
    if (isLastStep) {
      setShowResults(true);
    } else {
      setStepIndex((i) => i + 1);
    }
  }

  function goBack() {
    setStepIndex((i) => Math.max(0, i - 1));
  }

  function restart() {
    setAnswers({});
    setStepIndex(0);
    setShowResults(false);
  }

  if (showResults) {
    const matches = matchDestinations(answers).slice(0, 3);

    return (
      <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
        <div className="flex items-center gap-2 mb-1">
          <Sparkles size={18} className="text-meadow" aria-hidden="true" />
          <h2 className="text-lg font-medium text-gray-900">Your top matches</h2>
        </div>
        <p className="text-sm text-gray-500 mb-5">
          Based on what you told us, here&apos;s where we&apos;d point you first. Click any
          destination to explore it and search real flights and hotels.
        </p>

        <div className="grid sm:grid-cols-3 gap-4 mb-5">
          {matches.map(({ destination, matchedOn }) => (
            <div key={destination.slug} className="flex flex-col gap-2">
              <DestinationCard destination={destination} />
              {matchedOn.length > 0 && (
                <p className="text-xs text-gray-400 px-1">
                  Matches: {Array.from(new Set(matchedOn)).join(", ")}
                </p>
              )}
            </div>
          ))}
        </div>

        <button
          onClick={restart}
          className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 transition-colors"
        >
          <RotateCcw size={14} aria-hidden="true" />
          Start again
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
      {/* Progress bar */}
      <div className="flex gap-1 mb-5" role="presentation">
        {STEPS.map((s, i) => (
          <div
            key={s.id}
            className={`h-1.5 flex-1 rounded-full transition-colors ${
              i <= stepIndex ? "bg-meadow" : "bg-gray-200"
            }`}
          />
        ))}
      </div>

      <p className="text-xs uppercase tracking-wide text-meadow font-medium mb-1">
        {step.label}
      </p>
      <h2 className="text-lg font-medium text-gray-900 mb-1">{step.title}</h2>
      <p className="text-sm text-gray-500 mb-4">{step.sub}</p>

      <div className="flex flex-wrap gap-2 mb-1" role="group" aria-label={step.title}>
        {step.options.map((option) => {
          const isSelected = selected.includes(option);
          return (
            <button
              key={option}
              type="button"
              onClick={() => toggleOption(option)}
              aria-pressed={isSelected}
              className={`inline-flex items-center gap-1.5 text-sm px-3 py-2 rounded-full border transition-colors ${
                isSelected
                  ? "bg-meadow-light border-meadow text-meadow-dark font-medium"
                  : "border-gray-300 text-gray-700 hover:border-meadow hover:text-meadow"
              }`}
            >
              {isSelected && <Check size={14} aria-hidden="true" />}
              {option}
            </button>
          );
        })}
      </div>
      {step.multi && (
        <p className="text-xs text-gray-400 mt-2">Select one or more</p>
      )}

      <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-100">
        <button
          type="button"
          onClick={goBack}
          className={`inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 transition-colors ${
            stepIndex === 0 ? "invisible" : ""
          }`}
        >
          <ArrowLeft size={14} aria-hidden="true" />
          Back
        </button>
        <span className="text-xs text-gray-400">
          {stepIndex + 1} of {STEPS.length}
        </span>
        <button
          type="button"
          onClick={goNext}
          disabled={!canProceed}
          className="inline-flex items-center gap-1.5 text-sm bg-meadow text-white px-4 py-2 rounded-md hover:bg-meadow-dark transition-colors disabled:bg-gray-200 disabled:text-gray-400"
        >
          {isLastStep ? (
            <>
              See my matches <Sparkles size={14} aria-hidden="true" />
            </>
          ) : (
            <>
              Next <ArrowRight size={14} aria-hidden="true" />
            </>
          )}
        </button>
      </div>
    </div>
  );
}
