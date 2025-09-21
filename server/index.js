// server/index.js
// Minimal Express proxy for Google Places (findplace + photo) and weather placeholder.
// Run: node index.js

const express = require('express');
const fetch = require('node-fetch'); // node-fetch v2 style
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 5174;
const SERVER_GOOGLE_MAPS_API_KEY = process.env.SERVER_GOOGLE_MAPS_API_KEY || '';
const OPENWEATHER_KEY = process.env.OPENWEATHER_KEY || '';

if (!SERVER_GOOGLE_MAPS_API_KEY) {
  console.warn('Warning: SERVER_GOOGLE_MAPS_API_KEY not set in server/.env');
}

// === Route: place-photo-url ===
// Returns JSON { photoUrl: "https://..." } for a given place name
app.get('/api/place-photo-url', async (req, res) => {
  try {
    const place = req.query.place;
    if (!place) return res.status(400).json({ error: 'missing place parameter' });

    // 1) Find place (get photo_reference)
    const findUrl = `https://maps.googleapis.com/maps/api/place/findplacefromtext/json?input=${encodeURIComponent(place)}&inputtype=textquery&fields=place_id,photos,name&key=${SERVER_GOOGLE_MAPS_API_KEY}`;
    const findResp = await fetch(findUrl);
    const findJson = await findResp.json();

    if (!findJson || !Array.isArray(findJson.candidates) || findJson.candidates.length === 0) {
      return res.status(404).json({ error: 'place not found' });
    }

    const candidate = findJson.candidates[0];
    const photos = candidate.photos;
    if (!photos || photos.length === 0) {
      return res.status(404).json({ error: 'no photos available for this place' });
    }

    const photoRef = photos[0].photo_reference;
    if (!photoRef) {
      return res.status(404).json({ error: 'no photo_reference' });
    }

    // 2) Call Place Photo endpoint but capture redirect Location header
    const photoEndpoint = `https://maps.googleapis.com/maps/api/place/photo?maxwidth=1200&photoreference=${encodeURIComponent(photoRef)}&key=${SERVER_GOOGLE_MAPS_API_KEY}`;
    const photoResp = await fetch(photoEndpoint, { redirect: 'manual' });

    // Google responds with redirect to actual image URL (Location header)
    const location = photoResp.headers.get('location') || photoResp.headers.get('Location');
    if (!location) {
      // Fallback: return the proxy redirect endpoint
      return res.json({ photoUrl: `/api/place-photo?photoref=${encodeURIComponent(photoRef)}` });
    }

    return res.json({ photoUrl: location });
  } catch (e) {
    console.error('place-photo-url error', e);
    return res.status(500).json({ error: 'server error' });
  }
});

// === Route: find-place ===
// Returns Google Places findplacefromtext JSON (candidates with photos etc.)
app.get('/api/find-place', async (req, res) => {
  try {
    const q = req.query.q;
    if (!q) return res.status(400).json({ error: 'missing q' });
    const url = `https://maps.googleapis.com/maps/api/place/findplacefromtext/json?input=${encodeURIComponent(q)}&inputtype=textquery&fields=place_id,name,photos,geometry,formatted_address,rating&key=${SERVER_GOOGLE_MAPS_API_KEY}`;
    const r = await fetch(url);
    const json = await r.json();
    return res.json(json);
  } catch (e) {
    console.error('find-place error', e);
    return res.status(500).json({ error: 'server error' });
  }
});

app.post('/api/transport-options', async (req, res) => {
  try {
    const { origin, destination, budget } = req.body || {};
    if (!origin || !destination) return res.status(400).json({ error: 'Missing origin/destination' });

    // If you have GEMINI_API_KEY in .env, call Gemini; otherwise return a safe fallback.
    if (process.env.GEMINI_API_KEY) {
      // call Gemini (v1beta example) - adjust as needed
      const prompt = `
Suggest 3 transport options from ${origin} to ${destination} considering a budget of ₹${budget}.
Return strict JSON array of: { "mode","company","details","price","link" }.
`;
      const gemReq = await fetch(
        'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=' + process.env.GEMINI_API_KEY,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            // Basic request structure; your environment may require different fields
            prompt: prompt,
            temperature: 0.2,
            maxOutputTokens: 400
          })
        }
      );
      const gemJson = await gemReq.json().catch(() => null);
      const raw = gemJson?.candidates?.[0]?.content?.parts?.[0]?.text ?? gemJson?.output?.[0]?.content ?? null;
      if (raw) {
        try {
          const options = JSON.parse(raw);
          return res.json({ options });
        } catch (err) {
          // fallback to continue below
          console.warn('Gemini returned non-JSON, fallback to dummy', raw);
        }
      }
    }

    // Fallback (safe) options if Gemini not available or failed
    const fallback = [
      { mode: 'Flight', company: 'IndiGo', details: `Direct ${origin} → ${destination}`, price: Math.round((budget || 5000) * 0.15), link: `https://www.google.com/flights?hl=en#flt=${encodeURIComponent(origin)}.${encodeURIComponent(destination)}` },
      { mode: 'Train', company: 'IRCTC', details: `Express ${origin} → ${destination}`, price: Math.round((budget || 5000) * 0.05), link: 'https://www.irctc.co.in' },
      { mode: 'Bus', company: 'RedBus', details: `Overnight ${origin} → ${destination}`, price: Math.round((budget || 5000) * 0.03), link: 'https://www.redbus.in' }
    ];
    return res.json({ options: fallback });
  } catch (e) {
    console.error('transport-options error', e);
    return res.status(500).json({ error: 'server error' });
  }
});

// --- Simple chat proxy endpoint (frontend uses /api/chat) ---
app.post('/api/chat', async (req, res) => {
  try {
    const { message } = req.body || {};
    if (!message) return res.status(400).json({ error: 'missing message' });

    // If GEMINI key present, call it; otherwise echo back
    if (process.env.GEMINI_API_KEY) {
      const prompt = `User: ${message}\nAssistant: Provide a helpful reply about travel options.`;
      const gemReq = await fetch(
        'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=' + process.env.GEMINI_API_KEY,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            prompt,
            temperature: 0.2,
            maxOutputTokens: 300
          })
        }
      );
      const gemJson = await gemReq.json().catch(() => null);
      const raw = gemJson?.candidates?.[0]?.content?.parts?.[0]?.text ?? gemJson?.output?.[0]?.content ?? null;
      return res.json({ reply: raw ?? "Sorry, I couldn't get a reply." });
    }

    // fallback echo
    return res.json({ reply: `Echo: ${message}` });
  } catch (e) {
    console.error('chat proxy error', e);
    return res.status(500).json({ error: 'server error' });
  }
});

// === Route: place-photo ===
// Redirects to the real Google photo (used as fallback)
app.get('/api/place-photo', (req, res) => {
  try {
    const photoref = req.query.photoref;
    if (!photoref) return res.status(400).send('missing photoref');
    const photoUrl = `https://maps.googleapis.com/maps/api/place/photo?maxwidth=1200&photoreference=${encodeURIComponent(photoref)}&key=${SERVER_GOOGLE_MAPS_API_KEY}`;
    return res.redirect(photoUrl);
  } catch (e) {
    console.error('place-photo error', e);
    return res.status(500).send('server error');
  }
});

// === Route: weather (optional) ===
// Simple OpenWeather proxy for onecall; requires OPENWEATHER_KEY
app.get('/api/weather', async (req, res) => {
  try {
    const { lat, lng } = req.query;
    if (!lat || !lng) return res.status(400).json({ error: 'missing lat/lng' });
    if (!OPENWEATHER_KEY) return res.status(500).json({ error: 'server missing OPENWEATHER_KEY' });
    const url = `https://api.openweathermap.org/data/2.5/onecall?lat=${encodeURIComponent(lat)}&lon=${encodeURIComponent(lng)}&exclude=minutely,hourly,alerts&units=metric&appid=${OPENWEATHER_KEY}`;
    const r = await fetch(url);
    const j = await r.json();
    return res.json(j);
  } catch (e) {
    console.error('weather proxy error', e);
    return res.status(500).json({ error: 'server error' });
  }
});

app.listen(PORT, () => {
  console.log(`Server proxy running on http://localhost:${PORT}`);
});

app.post('/api/transport-options', async (req, res) => {
  try {
    const { origin, destination, budget, returnDate } = req.body || {};
    if (!origin || !destination) return res.status(400).json({ error: 'Missing origin/destination' });

    // Extract city names (remove airport codes in brackets)
    const cityOrigin = origin.replace(/\(.*?\)/g, '').trim();
    const cityDest = destination.replace(/\(.*?\)/g, '').trim();

    const fallback = [
      // --- Flights ---
      {
        mode: 'Flight',
        company: 'IndiGo',
        details: `Direct ${origin} → ${destination}`,
        price: Math.round((budget || 5000) * 0.15),
        link: `https://www.google.com/flights?hl=en#flt=${encodeURIComponent(origin)}.${encodeURIComponent(destination)}`
      },
      {
        mode: 'Flight (Return)',
        company: 'IndiGo',
        details: `Return ${destination} → ${origin}`,
        price: Math.round((budget || 5000) * 0.15),
        link: `https://www.google.com/flights?hl=en#flt=${encodeURIComponent(destination)}.${encodeURIComponent(origin)}${returnDate ? '.' + encodeURIComponent(returnDate) : ''}`
      },

      // --- Train ---
      {
        mode: 'Train',
        company: 'IRCTC',
        details: `Express ${cityOrigin} → ${cityDest}`,
        price: Math.round((budget || 5000) * 0.05),
        link: 'https://www.irctc.co.in'
      },

      // --- Bus ---
      {
        mode: 'Bus',
        company: 'RedBus',
        details: `Overnight ${cityOrigin} → ${cityDest}`,
        price: Math.round((budget || 5000) * 0.03),
        link: 'https://www.redbus.in'
      }
    ];

    return res.json({ options: fallback });
  } catch (e) {
    console.error('transport-options error', e);
    return res.status(500).json({ error: 'server error' });
  }
});

