// src/components/TransportOptions.tsx
import React, { useMemo } from "react";

type FlightDetails = {
  airline?: string;
  flightNumber?: string;
  departureAirport?: string; // e.g. BLR or "Bengaluru (BLR)"
  arrivalAirport?: string;
  departureTime?: string;
  arrivalTime?: string;
  estimatedCost?: number; // total for the group
  date?: string; // optional flight date YYYY-MM-DD
};

type DayPlan = {
  day?: number;
  transport?: {
    mode?: string;
    description?: string;
    estimatedCost?: number;
  };
};

type Props = {
  origin: string;
  destination: string;
  budget?: number;
  showReturn?: boolean;
  flightAirports?: { depart?: string; arrive?: string };
  // new:
  itineraryFlightDetails?: FlightDetails; // prefer real flight cost/info from itinerary
  dayPlan?: DayPlan; // day's transport costs if any (for local travel)
  isFirstDay?: boolean;
  isLastDay?: boolean;
};

const isAirportLike = (s?: string) => {
  if (!s) return false;
  const lower = s.toLowerCase();
  return lower.includes("airport") || /\([A-Z]{3}\)/.test(s);
};

const encodeSimple = (s?: string) => encodeURIComponent((s || "").split(",")[0].trim());

/** Deterministic fallback price generator */
const seededPrice = (min: number, max: number, seedStr = "") => {
  const seed = (seedStr || "seed").split("").reduce((acc, ch) => (acc * 31 + ch.charCodeAt(0)) >>> 0, 7);
  const range = Math.max(1, max - min + 1);
  const v = min + (seed % range);
  return Math.round(v);
};

/** Build an EasyMyTrip flight search URL with prefilled from/to and optional departDate */
const buildEasyMyTripUrl = (from?: string, to?: string, departDate?: string) => {
  const base = "https://www.easemytrip.com/flights/flight-search";
  if (!from || !to) return "https://www.easemytrip.com/";
  // EasyMyTrip expects city or IATA-like identifiers; pass whatever we have (IATA preferred)
  const q = `?tripType=O&from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}`;
  const d = departDate ? `&departDate=${encodeURIComponent(departDate)}` : "";
  return `${base}${q}${d}&adult=1&child=0&infant=0&class=E`;
};

/** RedBus direct search link using city names */
const buildRedBusUrl = (from?: string, to?: string) => {
  if (!from || !to) return "https://www.redbus.in/";
  const fn = encodeURIComponent((from || "").split(",")[0].trim());
  const tn = encodeURIComponent((to || "").split(",")[0].trim());
  return `https://www.redbus.in/search?fromCityName=${fn}&toCityName=${tn}`;
};

/** IRCTC homepage entry */
const buildIRCTCUrl = () => "https://www.irctc.co.in/nget/";

const buildTaxiUrl = (o: string, d: string) => {
  const q = encodeURIComponent(`${o} to ${d} taxi fare`);
  return `https://www.google.com/search?q=${q}`;
};

const formatCurrency = (n?: number) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(n ?? 0);

export const TransportOptions: React.FC<Props> = ({
  origin,
  destination,
  budget,
  showReturn = true,
  flightAirports,
  itineraryFlightDetails,
  dayPlan,
  isFirstDay = false,
  isLastDay = false,
}) => {
  const normO = origin || "";
  const normD = destination || "";
  const airports = flightAirports || {};
  const flight = itineraryFlightDetails;

  const options = useMemo(() => {
    const list: Array<{
      id: string;
      group: "Departures" | "Returns";
      type: "Flight" | "Train" | "Bus" | "Taxi/Car";
      title: string;
      desc: string;
      price: number;
      link: string;
      provider?: string;
    }> = [];

    // fallback price generator
    const mkPrice = (min: number, max: number, seed: string) => seededPrice(min, max, seed);

    const allowFlightsThisDay = isFirstDay || isLastDay;

    // ----- Arrival flights (first day) -----
    if (allowFlightsThisDay && isFirstDay) {
      // Prefer explicit itinerary flight cost if present
      if (flight?.departureAirport && flight?.arrivalAirport) {
        const p = flight.estimatedCost && flight.estimatedCost > 0 ? flight.estimatedCost : mkPrice(2500, 8000, `${flight.departureAirport}-${flight.arrivalAirport}-arrival`);
        list.push({
          id: "flight-itinerary-arrival",
          group: "Departures",
          type: "Flight",
          title: `Flight (arrival) — ${flight.departureAirport} → ${flight.arrivalAirport}`,
          desc: `${flight.airline ?? "Suggested"} ${flight.flightNumber ?? ""} — arrival at ${flight.arrivalAirport}`,
          price: p,
          link: buildEasyMyTripUrl(flight.departureAirport, flight.arrivalAirport, flight.date),
          provider: flight.airline || "EasyMyTrip",
        });
      } else if (airports.depart && airports.arrive) {
        const p = mkPrice(2500, 8000, `${airports.depart}-${airports.arrive}-arrival`);
        list.push({
          id: "flight-airport-arrival",
          group: "Departures",
          type: "Flight",
          title: `Flight (arrival) — ${airports.depart} → ${airports.arrive}`,
          desc: `${airports.depart} → ${airports.arrive} — search arrival flights`,
          price: p,
          link: buildEasyMyTripUrl(airports.depart, airports.arrive),
          provider: "EasyMyTrip",
        });
      } else if (isAirportLike(normO) || isAirportLike(normD)) {
        const p = mkPrice(2500, 8000, `${normO}-${normD}-arrival`);
        list.push({
          id: "flight-local-arrival",
          group: "Departures",
          type: "Flight",
          title: `Flight — ${normO.split(",")[0]} → ${normD.split(",")[0]}`,
          desc: `${normO} → ${normD} — search arrival flights`,
          price: p,
          link: buildEasyMyTripUrl(encodeSimple(normO), encodeSimple(normD)),
          provider: "EasyMyTrip",
        });
      }
    }

    // Local transport: prefer day's transport estimate if available
    const localTrainPrice = (dayPlan?.transport?.estimatedCost && dayPlan.transport.estimatedCost > 0)
      ? Math.round(dayPlan.transport.estimatedCost)
      : mkPrice(300, 3000, `train-${normO}-${normD}`);
    list.push({
      id: `train-${normO}-${normD}`,
      group: "Departures",
      type: "Train",
      title: "Train — Search (IRCTC / local)",
      desc: `${normO} → ${normD} by train`,
      price: localTrainPrice,
      link: buildIRCTCUrl(),
      provider: "IRCTC / Railways",
    });

    const localBusPrice = (dayPlan?.transport?.estimatedCost && dayPlan.transport.estimatedCost > 0)
      ? Math.round(dayPlan.transport.estimatedCost)
      : mkPrice(150, 2000, `bus-${normO}-${normD}`);
    list.push({
      id: `bus-${normO}-${normD}`,
      group: "Departures",
      type: "Bus",
      title: "Bus — Search (RedBus / operators)",
      desc: `${normO} → ${normD} by bus`,
      price: localBusPrice,
      link: buildRedBusUrl(normO, normD),
      provider: "RedBus",
    });

    const localTaxiPrice = (dayPlan?.transport?.estimatedCost && dayPlan.transport.estimatedCost > 0)
      ? Math.round(dayPlan.transport.estimatedCost)
      : mkPrice(800, 6000, `taxi-${normO}-${normD}`);
    list.push({
      id: `taxi-${normO}-${normD}`,
      group: "Departures",
      type: "Taxi/Car",
      title: "Taxi / Private Transfer",
      desc: `Private transfer: ${normO} → ${normD}`,
      price: localTaxiPrice,
      link: buildTaxiUrl(normO, normD),
      provider: "Local taxi / aggregator",
    });

    // ----- Returns (last day) -----
    if (showReturn && isLastDay) {
      if (allowFlightsThisDay && isLastDay) {
        if (flight?.arrivalAirport && flight?.departureAirport) {
          const p = flight.estimatedCost && flight.estimatedCost > 0 ? flight.estimatedCost : mkPrice(3000, 9000, `${flight.arrivalAirport}-${flight.departureAirport}-return`);
          list.push({
            id: "flight-itinerary-return",
            group: "Returns",
            type: "Flight",
            title: `Flight (return) — ${flight.arrivalAirport} → ${flight.departureAirport}`,
            desc: `${flight.airline ?? "Suggested"} ${flight.flightNumber ?? ""} — return`,
            price: p,
            link: buildEasyMyTripUrl(flight.arrivalAirport, flight.departureAirport, flight.date),
            provider: flight.airline || "EasyMyTrip",
          });
        } else if (airports.arrive && airports.depart) {
          const p = mkPrice(3000, 9000, `${airports.arrive}-${airports.depart}-return`);
          list.push({
            id: "flight-airport-return",
            group: "Returns",
            type: "Flight",
            title: `Flight (return) — ${airports.arrive} → ${airports.depart}`,
            desc: `${airports.arrive} → ${airports.depart} — search return flights`,
            price: p,
            link: buildEasyMyTripUrl(airports.arrive, airports.depart),
            provider: "EasyMyTrip",
          });
        }
      }

      // train/bus/taxi return options: reuse dayPlan transport estimate if present
      list.push({
        id: `train-ret-${normD}-${normO}`,
        group: "Returns",
        type: "Train",
        title: "Train — Return search",
        desc: `${normD} → ${normO} by train`,
        price: localTrainPrice,
        link: buildIRCTCUrl(),
        provider: "IRCTC / Railways",
      });
      list.push({
        id: `bus-ret-${normD}-${normO}`,
        group: "Returns",
        type: "Bus",
        title: "Bus — Return search",
        desc: `${normD} → ${normO} by bus`,
        price: localBusPrice,
        link: buildRedBusUrl(normD, normO),
        provider: "RedBus",
      });
      list.push({
        id: `taxi-ret-${normD}-${normO}`,
        group: "Returns",
        type: "Taxi/Car",
        title: "Taxi / Private transfer (return)",
        desc: `Private transfer: ${normD} → ${normO}`,
        price: localTaxiPrice,
        link: buildTaxiUrl(normD, normO),
        provider: "Local taxi / aggregator",
      });
    }

    // If neither first nor last day: remove flight entries (we only want local transit)
    if (!isFirstDay && !isLastDay) {
      return list.filter((it) => it.type !== "Flight").sort((a, b) => ((a.price ?? 0) - (b.price ?? 0)));
    }

    // otherwise sort within group by price ascending
    list.sort((a, b) => {
      if (a.group === b.group) return (a.price ?? 0) - (b.price ?? 0);
      return a.group === "Departures" ? -1 : 1;
    });

    return list;
  }, [normO, normD, airports, flight, dayPlan, showReturn, isFirstDay, isLastDay]);

  if (!origin || !destination) {
    return <div className="text-sm text-gray-500">Transport options will appear when origin and destination are available.</div>;
  }

  const departures = options.filter((o) => o.group === "Departures");
  const returns = options.filter((o) => o.group === "Returns");
  const cheapestOverall = options.reduce((min, o) => (!min || o.price < min.price ? o : min), options[0]);

  return (
    <div>
      <div className="space-y-4">
        <div>
          <div className="text-sm font-semibold mb-2">Departures</div>
          <div className="space-y-2">
            {departures.map((o) => {
              const isCheapest = cheapestOverall?.id === o.id;
              return (
                <div key={o.id} className={`flex items-center justify-between gap-3 p-3 rounded-lg ${isCheapest ? "border-2 border-green-600 bg-green-50" : "bg-gray-50"}`}>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <div className="text-sm font-semibold">{o.title}</div>
                      <div className="text-xs text-gray-500">· {o.provider ?? "Provider"}</div>
                    </div>
                    <div className="text-xs text-gray-600 mt-1">{o.desc}</div>
                  </div>
                  <div className="text-right flex flex-col items-end gap-2">
                    <div className="font-bold text-sm">{formatCurrency(o.price)}</div>
                    <a href={o.link} target="_blank" rel="noopener noreferrer" className="text-xs bg-blue-600 text-white px-3 py-1 rounded">Book</a>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {showReturn && returns.length > 0 && (
          <div>
            <div className="text-sm font-semibold mb-2">Returns / Reverse routes</div>
            <div className="space-y-2">
              {returns.map((o) => {
                const isCheapest = cheapestOverall?.id === o.id;
                return (
                  <div key={o.id} className={`flex items-center justify-between gap-3 p-3 rounded-lg ${isCheapest ? "border-2 border-green-600 bg-green-50" : "bg-gray-50"}`}>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <div className="text-sm font-semibold">{o.title}</div>
                        <div className="text-xs text-gray-500">· {o.provider ?? "Provider"}</div>
                      </div>
                      <div className="text-xs text-gray-600 mt-1">{o.desc}</div>
                    </div>
                    <div className="text-right flex flex-col items-end gap-2">
                      <div className="font-bold text-sm">{formatCurrency(o.price)}</div>
                      <a href={o.link} target="_blank" rel="noopener noreferrer" className="text-xs bg-blue-600 text-white px-3 py-1 rounded">Book</a>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {budget && (
        <div className="mt-3 text-xs text-gray-500">
          Budget: {formatCurrency(budget)} — flight & transport costs prefer itinerary values when available.
        </div>
      )}
    </div>
  );
};

export default TransportOptions;
