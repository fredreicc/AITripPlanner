// src/components/BookingLinks.tsx
import React from 'react';
import {
  buildEaseMyTripSearchUrl,
  buildGoogleFlightsUrl,
  buildEaseMyTripHotelSearchUrl,
  buildGoogleHotelUrl,
} from '../utils/bookingLinks';

type Props = {
  type?: 'flight' | 'hotel';
  origin?: string;
  destination?: string;
  date?: string; // YYYY-MM-DD
  location?: string; // hotel location
  checkin?: string;
  checkout?: string;
};

export const BookingLinks: React.FC<Props> = ({ type = 'flight', origin, destination, date, location, checkin, checkout }) => {
  // Defensive: normalize type
  const normalized = type === 'hotel' ? 'hotel' : 'flight';

  if (normalized === 'hotel') {
    const ease = buildEaseMyTripHotelSearchUrl(location || '', checkin, checkout);
    const google = buildGoogleHotelUrl(location || '');
    return (
      <div className="flex gap-3 items-center">
        <a
          href={google}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-md shadow"
          aria-label="View hotels on Google"
        >
          🔎 View Hotels
        </a>

        <a
          href={ease}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white px-3 py-2 rounded-md shadow"
          aria-label="Search hotels on EaseMyTrip"
        >
          🧳 EaseMyTrip
        </a>
      </div>
    );
  }

  // default: flight
  const flightsEase = buildEaseMyTripSearchUrl(origin || '', destination || '', date);
  const flightsGoogle = buildGoogleFlightsUrl(origin || '', destination || '', date);

  return (
    <div className="flex gap-3 items-center">
      <a
        href={flightsGoogle}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-md shadow"
        aria-label="Open in Google Flights"
      >
        ✈️ Google Flights
      </a>

      <a
        href={flightsEase}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white px-3 py-2 rounded-md shadow"
        aria-label="Search EaseMyTrip for flights"
      >
        🧳 EaseMyTrip
      </a>
    </div>
  );
};
