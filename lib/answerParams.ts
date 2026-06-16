// Encodes/decodes Trip Planner answers into a URL query string, so the
// answers a visitor gave on the homepage can travel with them to a
// destination page (used there to request a tailored AI itinerary
// without needing a server-side session).

export function encodeAnswers(answers: Record<string, string[] | undefined>): string {
  const params = new URLSearchParams();
  for (const [key, values] of Object.entries(answers)) {
    if (values && values.length > 0) {
      params.set(key, values.join("|"));
    }
  }
  return params.toString();
}

export function decodeAnswers(
  searchParams: Record<string, string | string[] | undefined>
): Record<string, string[]> {
  const result: Record<string, string[]> = {};
  for (const [key, value] of Object.entries(searchParams)) {
    if (typeof value === "string" && value.length > 0) {
      result[key] = value.split("|");
    }
  }
  return result;
}
