const SERVER_BASE = (import.meta.env.VITE_SERVER_URL as string) || 'http://localhost:5175';

// Clean up query (remove slashes, extra words like "various", "nearby")
function sanitizeQuery(q: string): string {
  return q
    .replace(/various|nearby/gi, '')
    .replace(/[\/]/g, ' ')
    .trim();
}

export async function fetchPlacePhotoUrl(placeName: string): Promise<string> {
  if (!placeName) {
    return `https://source.unsplash.com/featured/?travel`;
  }

  const cleaned = sanitizeQuery(placeName);

  try {
    const resp = await fetch(`${SERVER_BASE}/api/place-photo-url?place=${encodeURIComponent(cleaned)}`);
    if (!resp.ok) {
      // fallback to Unsplash
      return `https://source.unsplash.com/featured/?${encodeURIComponent(cleaned)}`;
    }
    const data = await resp.json();
    return data?.photoUrl || `https://source.unsplash.com/featured/?${encodeURIComponent(cleaned)}`;
  } catch {
    return `https://source.unsplash.com/featured/?${encodeURIComponent(cleaned)}`;
  }
}
