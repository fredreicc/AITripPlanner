// src/utils/bookingLinks.ts

// Flights
export function buildEaseMyTripSearchUrl(origin: string, destination: string, date?: string) {
  const parts = [`site:easemytrip.com`, 'flights', origin || '', 'to', destination || ''];
  if (date) parts.push(date);
  const q = encodeURIComponent(parts.join(' ').trim());
  return `https://www.google.com/search?q=${q}`;
}

export function buildGoogleFlightsUrl(origin: string, destination: string, date?: string) {
  const base = 'https://www.google.com/flights?hl=en';
  if (!origin || !destination) return base;
  if (!date) {
    return `${base}#flt=${encodeURIComponent(origin)}.${encodeURIComponent(destination)}`;
  }
  return `${base}#flt=${encodeURIComponent(origin)}.${encodeURIComponent(destination)}.${encodeURIComponent(date)}`;
}

// Hotels
export function buildEaseMyTripHotelSearchUrl(location: string, checkin?: string, checkout?: string) {
  const parts = [`site:easemytrip.com`, 'hotels', location || ''];
  if (checkin && checkout) parts.push(checkin, checkout);
  const q = encodeURIComponent(parts.join(' ').trim());
  return `https://www.google.com/search?q=${q}`;
}

export function buildGoogleHotelUrl(location: string) {
  if (!location) return 'https://www.google.com/travel/hotels';
  return `https://www.google.com/search?q=${encodeURIComponent(location + ' hotels')}`;
}
