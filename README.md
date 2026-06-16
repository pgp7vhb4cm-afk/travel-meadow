# Travel Meadow

A starter travel website: a personalised trip planner on the homepage,
destination pages, and real flight & hotel search powered by the
[Duffel API](https://duffel.com).

This is a real [Next.js](https://nextjs.org) project. The instructions
below assume no prior coding experience — just follow the steps in order.

---

## 1. Install Node.js

You need Node.js installed on your computer (version 18 or later).

1. Go to [nodejs.org](https://nodejs.org)
2. Download and install the **LTS** version for your operating system
3. To check it worked, open a terminal (on Mac: Terminal app, on Windows:
   Command Prompt) and type:

   ```
   node -v
   ```

   You should see something like `v20.x.x`.

---

## 2. Open this project in a terminal

Unzip this project somewhere on your computer (e.g. your Desktop), then in
your terminal, navigate into the folder. For example:

```
cd Desktop/travel-meadow
```

---

## 3. Install the project's dependencies

This downloads all the building blocks the project needs (Next.js, React,
icons, etc.) into a `node_modules` folder. Run:

```
npm install
```

This may take a minute or two.

---

## 4. Run it locally

```
npm run dev
```

Then open [http://localhost:3000](http://localhost:3000) in your browser.

You should see the Travel Meadow homepage with the trip planner. At this
point, flight and hotel searches will show **sample data** — that's
expected, and the next step explains how to connect real data.

---

## 5. Connect real flight & hotel data (Duffel)

The site uses [Duffel](https://duffel.com) for live flights and hotels.
Without a key, it falls back to sample data automatically — so the site
always works, but here's how to switch on real data:

1. Sign up for free at **[app.duffel.com/join](https://app.duffel.com/join)**
   (about 1 minute, no card required)
2. In the Duffel dashboard, go to **Developers → Access tokens** and create
   a new token. It will start with `duffel_test_` — this is a safe sandbox
   key (no real money, fake/test airlines and hotels)
3. In this project folder, **copy** the file `.env.local.example` and
   rename the copy to `.env.local`
4. Open `.env.local` and paste your key in, so it looks like:

   ```
   DUFFEL_API_KEY=duffel_test_abc123...
   ```

5. Stop the server (press `Ctrl+C` in the terminal) and restart it:

   ```
   npm run dev
   ```

Now flight and hotel searches on any destination page will use real Duffel
sandbox data. You'll see a green **"Live Duffel data"** badge above results
instead of the grey **"Sample data"** badge.

**Important:** `.env.local` is never committed to git and is only read on
the server, so your key is never exposed to visitors' browsers. This is
why the project has `app/api/flights/search` and `app/api/hotels/search`
— small secure backend routes that hold the key and talk to Duffel on your
website's behalf.

When you're ready for real bookings with real money, Duffel issues
`duffel_live_` keys — the code works the same way, you'd just also add a
payment provider (e.g. Stripe) into the booking step.

---

## 6. Connect AI-powered itineraries (Anthropic)

Each destination page can generate a tailored, day-by-day itinerary using
Claude with web search — so recommendations are grounded in what
reputable travel sites are currently saying, not just static text we
wrote. Without a key, a clearly-labelled sample itinerary is shown instead.

1. Sign up at **[console.anthropic.com](https://console.anthropic.com)**
   (this is the developer console — separate from claude.ai)
2. Add a payment method under **Settings → Billing** (pay-as-you-go, no
   subscription — each itinerary generation typically costs a few cents)
3. Go to **Settings → API keys** and create a new key (starts with
   `sk-ant-`)
4. Add it to your `.env.local` file:

   ```
   ANTHROPIC_API_KEY=sk-ant-...
   ```

5. Restart the server (`Ctrl+C`, then `npm run dev`)

Now the "Generate itinerary" button on any destination page will research
real, current recommendations and build a full itinerary — including the
number of stops implied by the visitor's trip style, 2-3 named
accommodation options per stop at different price points, a day-by-day
plan, and sources it used — instead of showing sample content.

---

## 7. Project structure

```
travel-meadow/
├── app/
│   ├── page.tsx                  → Homepage (hero + trip planner + destination grid)
│   ├── layout.tsx                → Shared header/footer for every page
│   ├── globals.css                → Global styles (Tailwind CSS)
│   ├── destinations/[slug]/
│   │   └── page.tsx              → Destination page (one per destination, e.g. /destinations/bali)
│   └── api/
│       ├── flights/search/route.ts → Secure backend route that calls Duffel for flights
│       ├── hotels/search/route.ts  → Secure backend route that calls Duffel for hotels
│       └── itinerary/route.ts      → Secure backend route that calls Claude for AI itineraries
├── components/
│   ├── TripPlanner.tsx           → The step-by-step questionnaire + matching results
│   ├── DestinationCard.tsx       → A destination preview card
│   ├── FlightSearch.tsx          → Flight search form + results
│   ├── HotelSearch.tsx           → Hotel search form + results
│   └── AiItineraryPanel.tsx      → AI-generated itinerary, shown on destination pages
├── lib/
│   ├── destinations.ts           → All destination content + matching logic
│   ├── duffel.ts                  → Duffel API client (server-only)
│   ├── anthropic.ts               → Claude API client for itineraries (server-only)
│   ├── answerParams.ts            → Encodes/decodes planner answers into URL params
│   └── mockData.ts                → Sample data shown when no API key is set
└── .env.local.example             → Template for your Duffel & Anthropic API keys
```

---

## 8. Adding or editing destinations

All destination content lives in **`lib/destinations.ts`** — each
destination is a plain object with its name, description, highlights, tips,
and the airport/coordinates used for searches. Add a new object to the
`DESTINATIONS` array and a page will automatically appear at
`/destinations/your-slug`.

The `tags` on each destination control how the trip planner matches it to a
visitor's answers — add or adjust tags to change how often a destination
gets recommended. Two answer types (`travelTime` and `region`) act as hard
filters rather than soft preferences — a destination tagged only for
long-haul travel won't be shown to someone who asked for a 3-hour flight,
even if it scores well on everything else.

---

## 9. Deploying the site

The easiest way to put this online is [Vercel](https://vercel.com) (made by
the creators of Next.js, free for personal projects):

1. Push this project to a GitHub repository
2. Go to [vercel.com/new](https://vercel.com/new) and import the repository
3. In the project settings, add environment variables:
   - Name: `DUFFEL_API_KEY`, Value: your Duffel key
   - Name: `ANTHROPIC_API_KEY`, Value: your Anthropic key
4. Deploy — Vercel builds and hosts it automatically

---

## 10. Ideas for what to build next

- **Booking flow**: Duffel's flow is search → price confirmation → create
  order (flights), or search → quote → booking (hotels). Each step needs
  the ID from the previous step.
- **Payments**: add [Stripe](https://stripe.com) when you're ready to take
  real bookings with a `duffel_live_` key.
- **User accounts & saved trips**: e.g. with
  [NextAuth.js](https://next-auth.js.org) and a database like
  [Supabase](https://supabase.com) or [Postgres](https://vercel.com/storage/postgres).
- **Cache itineraries**: store generated itineraries (e.g. in a database
  keyed by destination + answers) so identical requests don't re-trigger a
  fresh, paid AI generation every time.
- **Car hire**: add a `lib/carHire.ts` client following the same pattern as
  `lib/duffel.ts`, plus a new `app/api/cars/search/route.ts` — providers
  like Rentalcars/Cartrawler work similarly.
