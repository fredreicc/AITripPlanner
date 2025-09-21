// src/components/ItineraryDisplay.tsx
import React, { useEffect, useRef, useState } from 'react';
import { ItineraryPlan } from '../types';
import { BookingModal } from './BookingModal';
import { PlaneIcon } from './icons/PlaneIcon';
import { WeatherIcon } from './icons/WeatherIcon';
import { ActivityIcon } from './icons/ActivityIcon';
import { BedIcon } from './icons/BedIcon';
import { TransportIcon } from './icons/TransportIcon';
import { FoodIcon } from './icons/FoodIcon';
import { BookingLinks } from './BookingLinks';
import { fetchPlacePhotoUrl } from '../services/googlePlaces'; // server-proxied helper
import { TransportOptions } from './TransportOptions';

// module-level cache keeps images across component mounts/renders
const IMAGE_CACHE = new Map<string, string>();

// inline fallback SVG
const FALLBACK_SVG_DATA = `data:image/svg+xml;utf8,${encodeURIComponent(
  `<svg xmlns='http://www.w3.org/2000/svg' width='600' height='400'>
    <rect width='100%' height='100%' fill='#E5E7EB'/>
    <text x='50%' y='50%' dominant-baseline='middle' text-anchor='middle' fill='#9CA3AF' font-size='20'>Image unavailable</text>
  </svg>`
)}`;

/* ---------- ImageWithFallback component ---------- */
/**
 * Props:
 *  - src: primary image URL (may be null)
 *  - fallbackQuery: string used to ask Unsplash if primary fails (optional)
 *  - alt, className, style passed to <img>
 *
 * Logic: show src if present; if loading/error -> try unsplash with fallbackQuery;
 * if that fails, show inline FALLBACK_SVG_DATA.
 */
const ImageWithFallback: React.FC<{
  src?: string | null;
  fallbackQuery?: string;
  alt?: string;
  className?: string;
  style?: React.CSSProperties;
}> = ({ src, fallbackQuery, alt = '', className = '', style }) => {
  const [current, setCurrent] = useState<string | null>(src ?? null);
  const [triedUnsplash, setTriedUnsplash] = useState(false);

  useEffect(() => {
    // whenever src changes, start fresh
    setCurrent(src ?? null);
    setTriedUnsplash(false);
  }, [src]);

  // when primary is null, use unsplash immediately
  useEffect(() => {
    if (!current && fallbackQuery) {
      const unsplash = `https://source.unsplash.com/featured/?${encodeURIComponent(fallbackQuery)}`;
      setCurrent(unsplash);
      setTriedUnsplash(true);
    }
  }, [current, fallbackQuery]);

  const handleError = () => {
    // if we haven't tried unsplash yet, try it
    if (!triedUnsplash && fallbackQuery) {
      setCurrent(`https://source.unsplash.com/featured/?${encodeURIComponent(fallbackQuery)}`);
      setTriedUnsplash(true);
      return;
    }
    // final fallback: inline SVG
    setCurrent(FALLBACK_SVG_DATA);
  };

  return (
    // eslint-disable-next-line jsx-a11y/img-redundant-alt
    <img
      src={current ?? FALLBACK_SVG_DATA}
      alt={alt}
      className={className}
      style={style}
      onError={handleError}
      loading="lazy"
    />
  );
};

interface ItineraryDisplayProps {
  itinerary: ItineraryPlan;
  onReset: () => void;
}

export const ItineraryDisplay: React.FC<ItineraryDisplayProps> = ({ itinerary, onReset }) => {
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [selectedDay, setSelectedDay] = useState<number>(itinerary.dailyPlans?.[0]?.day ?? 1);
  const [mapPlaceQuery, setMapPlaceQuery] = useState<string | null>(null);
  const timelineRef = useRef<HTMLDivElement | null>(null);

  // timeline thumbnails
  const [thumbs, setThumbs] = useState<Record<string, string>>({});

  // chat modal state
  const [isChatOpen, setChatOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState<{ from: 'user' | 'bot'; text: string }[]>([]);
  const [chatInput, setChatInput] = useState('');

  // init mapPlaceQuery
  useEffect(() => {
    const first = itinerary.dailyPlans?.[0];
    if (first) {
      const place = first.activities?.[0]?.location ?? first.title;
      setMapPlaceQuery(place || null);
    }
  }, [itinerary]);

  // load timeline thumbs once
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const mapping: Record<string, string> = {};
      for (const plan of itinerary.dailyPlans) {
        const key = plan.title || `Day ${plan.day}`;
        if (IMAGE_CACHE.has(key)) {
          mapping[key] = IMAGE_CACHE.get(key)!;
          continue;
        }
        const place = plan.activities?.[0]?.location ?? plan.accommodation?.location ?? key;
        try {
          const url = await fetchPlacePhotoUrl(place);
          const final = url || `https://source.unsplash.com/featured/?${encodeURIComponent(place)}`;
          IMAGE_CACHE.set(key, final);
          mapping[key] = final;
        } catch {
          const fallback = `https://source.unsplash.com/featured/?${encodeURIComponent(place)}`;
          IMAGE_CACHE.set(key, fallback);
          mapping[key] = fallback;
        }
      }
      if (!cancelled) setThumbs(mapping);
    })();
    return () => { cancelled = true; };
  }, [itinerary]);

  // build map embed src
  const buildMapEmbedSrc = (q?: string) => {
    const key = (import.meta.env.VITE_GOOGLE_MAPS_API_KEY as string) || '';
    if (!key) return '';
    if (!q) return `https://www.google.com/maps/embed/v1/place?key=${key}&q=${encodeURIComponent(itinerary.tripTitle || 'tourist+attractions')}`;
    return `https://www.google.com/maps/embed/v1/search?key=${key}&q=${encodeURIComponent(q)}`;
  };

  // scroll selected day into view & update map
  useEffect(() => {
    const node = timelineRef.current?.querySelector(`[data-day="${selectedDay}"]`) as HTMLElement | null;
    if (node) node.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
    const plan = itinerary.dailyPlans.find(p => p.day === selectedDay);
    if (plan) {
      const place = plan.activities?.[0]?.location ?? plan.accommodation?.location ?? plan.title;
      setMapPlaceQuery(place ?? null);
    }
  }, [selectedDay, itinerary]);

  const formatCurrency = (amount: number) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount);

  // timeline scroll helpers
  const scrollTimeline = (dir: 'left' | 'right') => {
    if (!timelineRef.current) return;
    const distance = timelineRef.current.clientWidth * 0.6;
    timelineRef.current.scrollBy({ left: dir === 'left' ? -distance : distance, behavior: 'smooth' });
  };

  // chat send (UI + optional server)
  const sendChat = async (text: string) => {
    if (!text.trim()) return;
    setChatMessages(m => [...m, { from: 'user', text }]);
    setChatInput('');
    try {
      const resp = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text }),
      });
      if (!resp.ok) throw new Error('chat endpoint not available');
      const data = await resp.json();
      const reply = data?.reply ?? 'No reply';
      setChatMessages(m => [...m, { from: 'bot', text: reply }]);
    } catch (e) {
      // graceful fallback message
      setChatMessages(m => [...m, { from: 'bot', text: "Chat service not configured — your message was recorded locally." }]);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white p-6">
      {/* floating chat assistant */}
      <button
        onClick={() => setChatOpen(true)}
        aria-label="Chat assistant"
        className="fixed right-6 bottom-6 z-40 bg-green-600 text-white w-14 h-14 rounded-full shadow-lg flex items-center justify-center hover:scale-105 transition"
      >
        {/* simple chat icon */}
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" className="inline-block">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v10z" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      {/* Chat Modal */}
      {isChatOpen && (
        <div className="fixed inset-0 z-50 flex items-end justify-center md:items-center">
          <div className="absolute inset-0 bg-black/40" onClick={() => setChatOpen(false)} />
          <div className="relative w-full max-w-2xl bg-white rounded-t-xl md:rounded-xl shadow-xl p-4 md:p-6 m-4 md:m-0">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-semibold">Chat Assistant</h3>
              <button onClick={() => setChatOpen(false)} className="text-gray-500">Close</button>
            </div>
            <div className="max-h-72 overflow-y-auto space-y-2 mb-3 p-1">
              {chatMessages.map((m, i) => (
                <div key={i} className={`p-2 rounded-md ${m.from === 'user' ? 'bg-green-50 self-end text-right' : 'bg-gray-100'}`}>
                  <div className={`${m.from === 'user' ? 'text-green-800' : 'text-gray-800'}`}>{m.text}</div>
                </div>
              ))}
            </div>
            <form onSubmit={(e) => { e.preventDefault(); sendChat(chatInput); }}>
              <div className="flex gap-2">
                <input value={chatInput} onChange={(e) => setChatInput(e.target.value)} placeholder="Ask about this trip..." className="flex-1 border rounded px-3 py-2" />
                <button type="submit" className="bg-green-600 text-white px-4 py-2 rounded">Send</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* LEFT: Title + timeline */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-extrabold text-green-800">{itinerary.tripTitle}</h1>
              <p className="text-sm text-gray-600 mt-1">{itinerary.startDate ? `${itinerary.startDate} • ${itinerary.duration || itinerary.dailyPlans.length} days` : `${itinerary.dailyPlans.length} days`}</p>
            </div>

            <div className="flex items-center gap-3">
              <div className="text-right">
                <div className="text-sm text-gray-500">Total est.</div>
                <div className="text-xl font-bold text-green-700">{formatCurrency(itinerary.totalEstimatedCost)}</div>
              </div>
              <button onClick={() => setIsBookingModalOpen(true)} className="bg-green-600 text-white px-4 py-2 rounded-lg shadow hover:opacity-95">Book Trip</button>
            </div>
          </div>

          {/* timeline with arrow controls (no visible scrollbars) */}
          <div className="relative">
            <button aria-label="scroll left" onClick={() => scrollTimeline('left')} className="absolute left-0 top-1/2 -translate-y-1/2 z-20 bg-white p-2 rounded-full shadow">
              ◀
            </button>

            <div ref={timelineRef} className="flex gap-4 overflow-x-auto no-scrollbar pb-3 scroll-smooth" style={{ padding: '8px 48px' }}>
              {itinerary.dailyPlans.map(plan => {
                const key = plan.title || `Day ${plan.day}`;
                const thumb = thumbs[key];
                const isActive = selectedDay === plan.day;
                const weather = itinerary.weatherForecast?.daily?.[plan.day - 1];
                return (
                  <article
                    key={plan.day}
                    data-day={plan.day}
                    onClick={() => setSelectedDay(plan.day)}
                    className={`flex-shrink-0 w-80 sm:w-96 bg-white rounded-2xl cursor-pointer transform transition-all ${isActive ? 'scale-105 shadow-2xl border-2 border-green-500' : 'shadow-md hover:shadow-lg'}`}
                    style={{ overflow: 'hidden' }}
                  >
                    <div className="relative h-44 overflow-hidden rounded-t-2xl bg-gray-100">
                      <ImageWithFallback
                        src={thumb ?? null}
                        fallbackQuery={key || itinerary.destinationName || 'travel'}
                        alt={key}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute left-3 top-3 bg-white/90 px-3 py-1 rounded-full text-sm font-medium">{`Day ${plan.day}`}</div>

                      {/* weather chip */}
                      {weather && (
                        <div className="absolute right-3 top-3 bg-white/90 px-3 py-1 rounded-full text-xs font-medium flex items-center gap-2">
                          <WeatherIcon className="w-4 h-4" />
                          <span>{Math.round(weather.temp?.min ?? weather.lowTemp ?? 0)}° / {Math.round(weather.temp?.max ?? weather.highTemp ?? 0)}°</span>
                        </div>
                      )}
                    </div>

                    <div className="p-4">
                      <h3 className="text-lg font-semibold text-gray-900">{plan.title}</h3>
                      <p className="text-sm text-gray-600 mt-1">{plan.subtitle ?? `${plan.activities?.length || 0} activities • ${plan.transport?.mode ?? ''}`}</p>

                      <div className="mt-3 space-y-2">
                        {plan.activities.slice(0, 3).map((act: any, idx: number) => (
                          <ActivityCard key={idx} activity={act} plan={plan} itinerary={itinerary} />
                        ))}
                      </div>

                      <div className="mt-4 flex items-center justify-between">
                        <div className="text-sm text-gray-700 font-semibold">{formatCurrency(plan.estimatedCost ?? 0)}</div>
                        <div>
                          <BookingLinks type="hotel" location={plan.accommodation?.location ?? plan.activities?.[0]?.location} />
                        </div>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>

            <button aria-label="scroll right" onClick={() => scrollTimeline('right')} className="absolute right-0 top-1/2 -translate-y-1/2 z-20 bg-white p-2 rounded-full shadow">
              ▶
            </button>
          </div>

          {/* full details for selected day */}
          <div className="mt-6 bg-white rounded-2xl shadow p-5">
            <DayDetails
              plan={itinerary.dailyPlans.find(p => p.day === selectedDay)!}
              formatCurrency={formatCurrency}
              itinerary={itinerary}
            />
          </div>
        </div>

        {/* RIGHT: Sticky sidebar with map + quick cards */}
        <aside className="lg:col-span-1 sticky top-6 self-start">
          <div className="bg-white rounded-2xl shadow p-4 mb-4">
            <div className="h-56 w-full rounded-lg overflow-hidden bg-gray-100">
              {mapPlaceQuery ? (
                <iframe
                  title="map"
                  src={buildMapEmbedSrc(mapPlaceQuery)}
                  className="w-full h-full border-0"
                  loading="lazy"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-500">Map preview</div>
              )}
            </div>

            <div className="mt-3 space-y-2">
              <div className="text-sm text-gray-600">Quick actions</div>
              <div className="flex gap-2 mt-2">
                <a
                  href={buildGoogleFlightsUrl(itinerary.flightDetails?.departureAirport ?? '', itinerary.flightDetails?.arrivalAirport ?? '', itinerary.flightDetails?.departureTime ? new Date(itinerary.flightDetails.departureTime).toISOString().slice(0, 10) : undefined)}
                  target="_blank"
                  rel="noreferrer"
                  className="flex-1 inline-flex items-center justify-center gap-2 bg-blue-600 text-white px-3 py-2 rounded-md text-sm"
                >
                  Search Flights
                </a>
                <a
                  href={buildEaseMyTripHotelSearchUrl(itinerary.destinationName ?? itinerary.dailyPlans[0]?.title ?? '', undefined, undefined)}
                  target="_blank"
                  rel="noreferrer"
                  className="flex-1 inline-flex items-center justify-center gap-2 bg-orange-500 text-white px-3 py-2 rounded-md text-sm"
                >
                  Search Hotels
                </a>
              </div>
            </div>
          </div>

          {/* Hotels list preview */}
          <div className="bg-white rounded-2xl shadow p-4">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-sm font-semibold">Nearby hotels</h4>
              <span className="text-xs text-gray-500">approx</span>
            </div>
            {itinerary.dailyPlans.slice(0, 3).map((p, i) => (
              <div key={i} className="flex items-center gap-3 py-2 border-t first:border-t-0">
                <div className="w-14 h-12 bg-gray-100 rounded-md overflow-hidden">
                  <ImageWithFallback
                    src={thumbs[p.title ?? `Day ${p.day}`] ?? null}
                    fallbackQuery={p.title ?? itinerary.destinationName ?? 'hotel'}
                    alt={`Hotel near ${p.title}`}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-1">
                  <div className="text-sm font-medium">Hotel near {p.title}</div>
                  <div className="text-xs text-gray-500">from ₹{Math.max(1500, Math.round((p.accommodation?.estimatedCost ?? 2000) * 0.8))}</div>
                </div>
                <div>
                  <a href={buildGoogleHotelUrl(p.accommodation?.location ?? p.title ?? '')} target="_blank" rel="noreferrer" className="text-sm bg-green-600 text-white px-3 py-1 rounded">View</a>
                </div>
              </div>
            ))}
          </div>
        </aside>
      </div>

      <BookingModal isOpen={isBookingModalOpen} onClose={() => setIsBookingModalOpen(false)} totalCost={itinerary.totalEstimatedCost} />
    </div>
  );
};

/* ---------- ActivityCard ---------- */
const ActivityCard: React.FC<{ activity: any, plan: any, itinerary: ItineraryPlan }> = ({ activity, plan, itinerary }) => {
  const thumb = usePlaceImageHook(activity.location,
    plan.accommodation?.location || itinerary.destinationName);
  return (
    <div className="bg-gray-50 rounded-lg shadow-sm overflow-hidden">
      <div className="flex">
        <div className="w-28 h-20 flex-shrink-0 overflow-hidden">
          <ImageWithFallback
            src={thumb ?? null}
            fallbackQuery={activity.location || plan?.title || itinerary.destinationName || 'travel'}
            alt={activity.location}
            className="w-full h-full object-cover"
          />

        </div>
        <div className="p-3 flex-1">
          <p className="font-semibold">{activity.description}</p>
          <p className="text-sm text-gray-600">{activity.time}</p>
          <p className="text-sm font-medium text-green-700 mt-1">{new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(activity.estimatedCost ?? 0)}</p>
          <a href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(activity.location)}`} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:underline mt-1 block">
            📍 {activity.location}
          </a>
        </div>
      </div>
    </div>
  );
};

/* ---------- AccommodationCard ---------- */
const AccommodationCard: React.FC<{ accommodation: any }> = ({ accommodation }) => {
  const thumb = usePlaceImageHook(accommodation.location);
  return (
    <div className="bg-gray-50 rounded-lg shadow-sm overflow-hidden">
      <div className="flex">
        <div className="w-28 h-20 flex-shrink-0 overflow-hidden">
          <ImageWithFallback
            src={thumb ?? null}
            fallbackQuery={accommodation.location || accommodation.name || 'hotel'}
            alt={accommodation.location}
            className="w-full h-full object-cover"
          />
        </div>
        <div className="p-3 flex-1">
          <h5 className="flex items-center text-md font-semibold text-gray-800 mb-1"><BedIcon className="w-5 h-5 mr-2" /> {accommodation.name}</h5>
          <p className="text-sm text-gray-600">{accommodation.description}</p>
          <p className="text-sm font-medium text-green-700 mt-1">{new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(accommodation.estimatedCost ?? 0)}</p>
          <a href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(accommodation.location)}`} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:underline mt-1 block">
            📍 {accommodation.location}
          </a>
        </div>
      </div>
    </div>
  );
};

/* ---------- usePlaceImageHook ---------- */
function usePlaceImageHook(place?: string | null, p0?: any) {
  const [src, setSrc] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    if (!place) {
      setSrc(`https://source.unsplash.com/featured/?travel`);
      return;
    }

    (async () => {
      const url = await fetchPlacePhotoUrl(place);
      if (mounted) setSrc(url);
    })();

    return () => { mounted = false; };
  }, [place]);

  return src;
}

/* ---------- DayDetails component ---------- */
const DayDetails: React.FC<{ plan: any; formatCurrency: (n: number) => string; itinerary: ItineraryPlan; }> = ({ plan, formatCurrency, itinerary }) => {
  if (!plan) return <div>No details</div>;
  const dayIndex = itinerary.dailyPlans.findIndex(p => p.day === plan.day);
  const totalDays = itinerary.dailyPlans.length;
  const origin = dayIndex === 0
    ? itinerary.flightDetails?.arrivalAirport
    : itinerary.dailyPlans[dayIndex - 1]?.accommodation?.location;
  const destination = plan.accommodation?.location;
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div className="md:col-span-2">
        <h3 className="text-lg font-semibold mb-2">{plan.title}</h3>
        <div className="space-y-4">
          {plan.activities.map((act: any, idx: number) => (
            <div key={idx} className="flex gap-3 items-start bg-gray-50 rounded-lg p-3">
              <div className="w-12 h-12 rounded-md bg-white flex items-center justify-center">
                <ActivityIcon className="w-5 h-5 text-gray-600" />
              </div>
              <div>
                <div className="font-medium">{act.description}</div>
                <div className="text-xs text-gray-500">{act.time} • {act.location}</div>
                <div className="text-sm text-green-700 mt-1">{formatCurrency(act.estimatedCost)}</div>
                <div className="mt-2">
                  <a href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(act.location)}`} target="_blank" rel="noreferrer" className="text-xs text-blue-600 hover:underline">Open in maps</a>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <aside className="space-y-3">
        <div className="bg-white rounded-lg shadow p-3">
          <div className="text-sm text-gray-500">Accommodation</div>
          <div className="mt-2 font-medium">{plan.accommodation?.name}</div>
          <div className="text-xs text-gray-500">{plan.accommodation?.description}</div>
          <div className="mt-2 font-semibold text-green-700">{formatCurrency(plan.accommodation?.estimatedCost ?? 0)}</div>
          <div className="mt-3"><BookingLinks type="hotel" location={plan.accommodation?.location} /></div>
        </div>

        <div className="bg-white rounded-lg shadow p-3">
          <div className="text-sm text-gray-500">Transport</div>
          <div className="mt-1 font-medium">{plan.transport?.mode}</div>
          <div className="text-xs text-gray-500">{plan.transport?.description}</div>
          <div className="mt-2 font-semibold">{formatCurrency(plan.transport?.estimatedCost ?? 0)}</div>
        </div>
        {/* Transport options preview */}
        <div className="bg-white rounded-2xl shadow p-4 mt-4">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-sm font-semibold">Transport options</h4>
            <span className="text-xs text-gray-500">AI suggested</span>
          </div>
          <TransportOptions
            origin={origin}
            destination={destination}
            budget={plan.estimatedCost}
            showReturn={true}
            flightAirports={{
              depart: itinerary.flightDetails?.departureAirport,
              arrive: itinerary.flightDetails?.arrivalAirport,
            }}
            isFirstDay={dayIndex === 0}
            isLastDay={dayIndex === totalDays - 1}
          />

        </div>

      </aside>
    </div>
  );
};

/* ---------- small booking link helpers used in this file (reuse your utils if you prefer) ---------- */
function buildGoogleFlightsUrl(origin: string, destination: string, date?: string) {
  const base = 'https://www.google.com/flights?hl=en';
  if (!origin || !destination) return base;
  if (!date) return `${base}#flt=${encodeURIComponent(origin)}.${encodeURIComponent(destination)}`;
  return `${base}#flt=${encodeURIComponent(origin)}.${encodeURIComponent(destination)}.${encodeURIComponent(date)}`;
}
function buildEaseMyTripHotelSearchUrl(location: string, checkin?: string, checkout?: string) {
  const parts = [`site:easemytrip.com`, 'hotels', location || ''];
  if (checkin && checkout) parts.push(checkin, checkout);
  const q = encodeURIComponent(parts.join(' ').trim());
  return `https://www.google.com/search?q=${q}`;
}
function buildGoogleHotelUrl(location: string) {
  if (!location) return 'https://www.google.com/travel/hotels';
  return `https://www.google.com/search?q=${encodeURIComponent(location + ' hotels')}`;
}
