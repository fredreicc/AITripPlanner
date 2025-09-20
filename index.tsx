import React, { useState, useCallback, useMemo, useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import { GoogleGenAI, Type } from '@google/genai';

// --- START OF types.ts ---
export interface TripPreferences {
  source: string;
  destination: string;
  budget: number;
  startDate: string;
  endDate: string;
  numPeople: number;
  interests: string[];
}

export interface Activity {
  time: string;
  description: string;
  estimatedCost: number;
  location: string;
}

export interface Accommodation {
  name: string;
  description: string;
  estimatedCost: number;
  location: string;
}

export interface Transport {
    mode: string;
    description: string;
    estimatedCost: number;
}

export interface Food {
    description: string;
    estimatedCost: number;
}

export interface DailyPlan {
  day: number;
  title: string;
  activities: Activity[];
  accommodation: Accommodation;
  transport: Transport;
  food: Food;
}

export interface FlightDetails {
    airline: string;
    flightNumber: string;
    departureAirport: string;
    arrivalAirport: string;
    departureTime: string;
    arrivalTime: string;
    estimatedCost: number;
}

export interface DailyWeather {
    day: number;
    highTemp: number;
    lowTemp: number;
    description: string;
}

export interface WeatherForecast {
    summary: string;
    daily: DailyWeather[];
}

export interface ItineraryPlan {
  tripTitle: string;
  totalEstimatedCost: number;
  currency: string;
  flightDetails: FlightDetails;
  weatherForecast: WeatherForecast;
  dailyPlans: DailyPlan[];
}
// --- END OF types.ts ---

// --- START OF ICONS ---
const MapPinIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
  </svg>
);
const CalendarIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0h18M-4.5 12h22.5" />
  </svg>
);
const CurrencyRupeeIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 8.25H9m6 3H9m3 6l-3-3h1.5a3 3 0 100-6M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);
const SparklesIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.898 20.572L16.5 21.75l-.398-1.178a3.375 3.375 0 00-2.456-2.456L12.5 17.25l1.178-.398a3.375 3.375 0 002.456-2.456L16.5 13.5l.398 1.178a3.375 3.375 0 002.456 2.456l1.178.398-1.178.398a3.375 3.375 0 00-2.456 2.456z" />
  </svg>
);
const ActivityIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12.75 3.03v.568c0 .334.148.65.405.864l1.068.89c.442.369.535 1.01.216 1.49l-1.08.902a2.25 2.25 0 01-1.421.65H12a2.25 2.25 0 00-2.25 2.25v.568c0 .41.34.75.75.75h1.5a.75.75 0 00.75-.75v-.568c0-.41-.34-.75-.75-.75h-.75a.75.75 0 01-.75-.75v-.568c0-.92.75-1.67 1.67-1.67h1.5a.75.75 0 00.6-.3l1.08-.902c.319-.48.226-1.121-.216-1.49l-1.068-.89a1.125 1.125 0 00-.405-.864v-.568a1.125 1.125 0 00-2.25 0z" />
     <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a8.25 8.25 0 100-16.5 8.25 8.25 0 000 16.5z" />
  </svg>
);
const BedIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />
  </svg>
);
const TransportIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.125-.504 1.125-1.125V14.25m-17.25 4.5v-1.875a3.375 3.375 0 003.375-3.375h1.5a1.125 1.125 0 011.125 1.125v-1.5a3.375 3.375 0 00-3.375-3.375H9.75" />
  </svg>
);
const FoodIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
     <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.75c-1.054 0-1.92.5-2.5 1.25-.58-.75-1.446-1.25-2.5-1.25-1.176 0-2.125.955-2.125 2.125 0 1.956 2.062 4.416 4.625 6.375 2.562-1.959 4.625-4.419 4.625-6.375C14.125 7.705 13.176 6.75 12 6.75z" />
  </svg>
);
const MapIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 6.75V15m0 0v2.25m0-2.25h1.5m-1.5 0H5.25m0 0H3.75m0 0v-2.25m0 2.25v-6.75a2.25 2.25 0 012.25-2.25h1.5a2.25 2.25 0 012.25 2.25v6.75m0 0h1.5m-1.5 0H9.75m0 0H12m0 0V9m0 0V6.75m0 2.25h1.5m0 0H15m0 0v2.25m0 2.25v-6.75a2.25 2.25 0 012.25-2.25h1.5a2.25 2.25 0 012.25 2.25v6.75m0 0h-1.5m-1.5 0v-2.25m0 2.25V15m0 0v2.25m0-2.25h-1.5m1.5 0h.008v.008h-.008V15zm-12 0h.008v.008H9V15z" />
  </svg>
);
const UsersIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 00-12 0m12 0a9.094 9.094 0 01-12 0m12 0A4.956 4.956 0 0115 15.75a4.956 4.956 0 01-3 1.47m-3-1.47a4.956 4.956 0 01-3-1.47m-3-1.47a4.956 4.956 0 013 1.47m0 0V11.25m0 4.5v-4.5m0 4.5h.008m-12.75 0h.008" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.094 9.094 0 004.5-1.47m-9 0A9.094 9.094 0 0012 21zm0 0V15m0 6v-6m0 6h.008m-6.75 0h.008" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
);
const WeatherIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15a4.5 4.5 0 004.5 4.5H18a3.75 3.75 0 001.332-7.257 3 3 0 00-2.666-5.113 5.25 5.25 0 00-10.512 1.432 4.5 4.5 0 00-1.246 8.418" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6.75v.008h.008v-.008h-.008z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 12.75v.008h.008v-.008h-.008z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 6.75v.008h.008v-.008h-.008z" />
    </svg>
);
const PlaneIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
    </svg>
);
// --- END OF ICONS ---


// --- START OF geminiService.ts ---
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const itinerarySchema = {
  type: Type.OBJECT,
  properties: {
    tripTitle: { type: Type.STRING },
    totalEstimatedCost: { type: Type.NUMBER },
    currency: { type: Type.STRING },
    flightDetails: {
      type: Type.OBJECT,
      properties: {
        airline: { type: Type.STRING },
        flightNumber: { type: Type.STRING },
        departureAirport: { type: Type.STRING },
        arrivalAirport: { type: Type.STRING },
        departureTime: { type: Type.STRING },
        arrivalTime: { type: Type.STRING },
        estimatedCost: { type: Type.NUMBER },
      },
      required: ['airline', 'flightNumber', 'departureAirport', 'arrivalAirport', 'departureTime', 'arrivalTime', 'estimatedCost'],
    },
    weatherForecast: {
        type: Type.OBJECT,
        properties: {
            summary: { type: Type.STRING },
            daily: {
                type: Type.ARRAY,
                items: {
                    type: Type.OBJECT,
                    properties: {
                        day: { type: Type.INTEGER },
                        highTemp: { type: Type.NUMBER, description: "High temperature in Celsius" },
                        lowTemp: { type: Type.NUMBER, description: "Low temperature in Celsius" },
                        description: { type: Type.STRING },
                    },
                    required: ['day', 'highTemp', 'lowTemp', 'description']
                }
            }
        },
        required: ['summary', 'daily']
    },
    dailyPlans: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          day: { type: Type.INTEGER },
          title: { type: Type.STRING },
          activities: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                time: { type: Type.STRING },
                description: { type: Type.STRING },
                estimatedCost: { type: Type.NUMBER },
                location: { type: Type.STRING, description: 'A mappable address or name of the place' },
              },
              required: ['time', 'description', 'estimatedCost', 'location'],
            },
          },
          accommodation: {
            type: Type.OBJECT,
            properties: {
              name: { type: Type.STRING },
              description: { type: Type.STRING },
              estimatedCost: { type: Type.NUMBER },
              location: { type: Type.STRING, description: 'A mappable address or name of the place' },
            },
            required: ['name', 'description', 'estimatedCost', 'location'],
          },
          transport: {
              type: Type.OBJECT,
              properties: {
                  mode: {type: Type.STRING},
                  description: {type: Type.STRING},
                  estimatedCost: {type: Type.NUMBER}
              },
              required: ['mode', 'description', 'estimatedCost']
          },
          food: {
              type: Type.OBJECT,
              properties: {
                  description: {type: Type.STRING},
                  estimatedCost: {type: Type.NUMBER}
              },
              required: ['description', 'estimatedCost']
          }
        },
        required: ['day', 'title', 'activities', 'accommodation', 'transport', 'food'],
      },
    },
  },
  required: ['tripTitle', 'totalEstimatedCost', 'currency', 'flightDetails', 'weatherForecast', 'dailyPlans'],
};

const generateItinerary = async (prefs: TripPreferences): Promise<ItineraryPlan> => {
  const duration = Math.ceil((new Date(prefs.endDate).getTime() - new Date(prefs.startDate).getTime()) / (1000 * 3600 * 24)) + 1;

  const prompt = `Generate a personalized travel itinerary.
- Trip Details:
  - From: ${prefs.source}, India
  - To: ${prefs.destination}, India
  - Start Date: ${prefs.startDate}
  - End Date: ${prefs.endDate}
  - Duration: ${duration} days
  - Number of People: ${prefs.numPeople}
- Budget and Interests:
  - Total Budget: Approximately ${prefs.budget} INR for ${prefs.numPeople} people.
  - Traveler Interests: ${prefs.interests.join(', ')}.

The itinerary must include the following sections:
1.  **Flight Details**: Suggest a plausible round-trip flight from the source to the destination. Include a realistic airline, flight number, times, and estimated cost for ${prefs.numPeople} people.
2.  **Weather Forecast**: Provide a weather forecast for ${prefs.destination} for the duration of the trip. Include an overall summary and a brief daily forecast (high/low temps in Celsius, conditions).
3.  **Daily Plans**: A detailed day-by-day plan. For each day, provide:
    - Specific activities with times, descriptions, costs, and mappable locations.
    - An accommodation suggestion (e.g., a specific hotel name) with a description, cost, and mappable location.
    - Local transportation and food suggestions with estimated costs.

Constraints:
- All costs must be in Indian Rupees (INR).
- The total estimated cost must be a reasonable aggregation of all individual costs (flights, accommodation, activities, etc.).
- The 'location' field for activities and accommodation MUST be a specific, real-world address or place name that can be found on a map.
- The plan should be practical, creative, and adhere to the budget and interests provided.`;

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: prompt,
    config: {
      responseMimeType: 'application/json',
      responseSchema: itinerarySchema,
      temperature: 0.7,
    },
  });

  try {
    const jsonText = response.text.trim();
    const itineraryData = JSON.parse(jsonText);
    return itineraryData as ItineraryPlan;
  } catch (e) {
    console.error("Failed to parse Gemini response:", response.text);
    throw new Error("The AI returned an invalid itinerary format. Please try again.");
  }
};
// --- END OF geminiService.ts ---

// --- START OF TripForm.tsx ---
interface TripFormProps {
  onSubmit: (preferences: TripPreferences) => void;
}

const interestOptions = [
  "Cultural Heritage",
  "Nightlife",
  "Adventure",
  "Foodie",
  "Relaxation",
  "Nature & Wildlife",
  "Shopping",
];

const TripForm: React.FC<TripFormProps> = ({ onSubmit }) => {
  const [source, setSource] = useState('Mumbai');
  const [destination, setDestination] = useState('Goa');
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 5);
  const [endDate, setEndDate] = useState(tomorrow.toISOString().split('T')[0]);
  const [numPeople, setNumPeople] = useState(2);
  const [budget, setBudget] = useState(50000);
  const [interests, setInterests] = useState<string[]>(["Relaxation", "Foodie"]);

  const handleInterestChange = (interest: string) => {
    setInterests((prev) =>
      prev.includes(interest)
        ? prev.filter((i) => i !== interest)
        : [...prev, interest]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (destination && startDate && endDate && budget > 0 && interests.length > 0 && numPeople > 0) {
      onSubmit({ source, destination, startDate, endDate, budget, numPeople, interests });
    }
  };

  return (
    <div className="bg-white p-8 rounded-2xl shadow-lg animate-fade-in">
      <h2 className="text-3xl font-bold text-gray-800 mb-2">Plan Your Perfect Getaway</h2>
      <p className="text-gray-600 mb-8">Tell us your travel style, and our AI will craft a unique itinerary just for you.</p>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="source" className="block text-sm font-medium text-gray-700 mb-2">From</label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <MapPinIcon className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  id="source"
                  value={source}
                  onChange={(e) => setSource(e.target.value)}
                  required
                  className="w-full pl-10 pr-4 py-2 bg-white border border-gray-300 rounded-lg focus:ring-brand-secondary focus:border-brand-secondary"
                  placeholder="e.g., Delhi"
                />
              </div>
            </div>
            <div>
              <label htmlFor="destination" className="block text-sm font-medium text-gray-700 mb-2">To</label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <MapPinIcon className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  id="destination"
                  value={destination}
                  onChange={(e) => setDestination(e.target.value)}
                  required
                  className="w-full pl-10 pr-4 py-2 bg-white border border-gray-300 rounded-lg focus:ring-brand-secondary focus:border-brand-secondary"
                  placeholder="e.g., Kerala"
                />
              </div>
            </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 mb-2">Start Date</label>
            <div className="relative">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                <CalendarIcon className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="date"
                id="startDate"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                min={new Date().toISOString().split('T')[0]}
                required
                className="w-full pl-10 pr-4 py-2 bg-white border border-gray-300 rounded-lg focus:ring-brand-secondary focus:border-brand-secondary"
              />
            </div>
          </div>
          <div>
            <label htmlFor="endDate" className="block text-sm font-medium text-gray-700 mb-2">End Date</label>
             <div className="relative">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                <CalendarIcon className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="date"
                id="endDate"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                min={startDate}
                required
                className="w-full pl-10 pr-4 py-2 bg-white border border-gray-300 rounded-lg focus:ring-brand-secondary focus:border-brand-secondary"
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
                <label htmlFor="numPeople" className="block text-sm font-medium text-gray-700 mb-2">Number of People</label>
                <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                    <UsersIcon className="h-5 w-5 text-gray-400" />
                </div>
                <input
                    type="number"
                    id="numPeople"
                    value={numPeople}
                    onChange={(e) => setNumPeople(parseInt(e.target.value, 10))}
                    min="1"
                    required
                    className="w-full pl-10 pr-4 py-2 bg-white border border-gray-300 rounded-lg focus:ring-brand-secondary focus:border-brand-secondary"
                />
                </div>
            </div>
            <div>
                <label htmlFor="budget" className="block text-sm font-medium text-gray-700 mb-2">Budget (INR)</label>
                <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                    <CurrencyRupeeIcon className="h-5 w-5 text-gray-400" />
                </div>
                <input
                    type="number"
                    id="budget"
                    value={budget}
                    onChange={(e) => setBudget(parseInt(e.target.value, 10))}
                    min="1000"
                    step="1000"
                    required
                    className="w-full pl-10 pr-4 py-2 bg-white border border-gray-300 rounded-lg focus:ring-brand-secondary focus:border-brand-secondary"
                />
                </div>
            </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">Interests</label>
          <div className="flex flex-wrap gap-3">
            {interestOptions.map((interest) => (
              <button
                key={interest}
                type="button"
                onClick={() => handleInterestChange(interest)}
                className={`px-4 py-2 rounded-full text-sm font-semibold transition-all duration-200 ${
                  interests.includes(interest)
                    ? 'bg-brand-primary text-white ring-2 ring-offset-2 ring-brand-secondary'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {interest}
              </button>
            ))}
          </div>
        </div>
        
        <button
          type="submit"
          className="w-full bg-brand-primary text-white font-bold py-3 px-4 rounded-lg hover:bg-brand-dark transition-transform transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-primary"
        >
          Generate Itinerary
        </button>
      </form>
    </div>
  );
};
// --- END OF TripForm.tsx ---

// --- START OF LoadingSpinner.tsx ---
interface LoadingSpinnerProps {
    preferences: TripPreferences | null;
}

const messages = [
    "Consulting local guides...",
    "Finding hidden gems for you...",
    "Aligning the stars for a perfect trip...",
    "Packing your virtual bags...",
    "Cross-referencing weather patterns...",
    "Crafting your unique adventure...",
    "Checking for the best photo spots..."
];

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ preferences }) => {
    const [message, setMessage] = React.useState(messages[0]);

    React.useEffect(() => {
        const intervalId = setInterval(() => {
            setMessage(messages[Math.floor(Math.random() * messages.length)]);
        }, 2500);

        return () => clearInterval(intervalId);
    }, []);

    return (
        <div className="flex flex-col items-center justify-center p-8 bg-white rounded-2xl shadow-lg text-center animate-fade-in">
            <div className="w-16 h-16 border-4 border-brand-secondary border-t-transparent rounded-full animate-spin"></div>
            <h2 className="text-2xl font-bold text-gray-800 mt-6">Generating Your Itinerary...</h2>
            {preferences && (
                 <p className="text-gray-600 mt-2">
                    Crafting a trip from <strong>{preferences.source}</strong> to <strong>{preferences.destination}</strong> for {preferences.numPeople} {preferences.numPeople > 1 ? 'people' : 'person'}.
                 </p>
            )}
            <p className="text-brand-primary font-semibold mt-4 h-6 transition-opacity duration-500">{message}</p>
        </div>
    );
};
// --- END OF LoadingSpinner.tsx ---

// --- START OF BookingModal.tsx ---
interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  totalCost: number;
}

type BookingState = 'FORM' | 'PROCESSING' | 'CONFIRMED';

const BookingModal: React.FC<BookingModalProps> = ({ isOpen, onClose, totalCost }) => {
  const [bookingState, setBookingState] = useState<BookingState>('FORM');

  useEffect(() => {
    if (isOpen) {
      setBookingState('FORM');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handlePay = (e: React.FormEvent) => {
    e.preventDefault();
    setBookingState('PROCESSING');
    setTimeout(() => {
      setBookingState('CONFIRMED');
    }, 2000);
  };
  
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
    }).format(amount);
  };

  const renderContent = () => {
    switch(bookingState) {
        case 'PROCESSING':
            return (
                <div className="text-center p-8">
                    <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
                    <h3 className="text-xl font-semibold mt-4">Processing Payment...</h3>
                    <p className="text-gray-600 mt-2">Securely contacting booking partners.</p>
                </div>
            );
        case 'CONFIRMED':
            return (
                <div className="text-center p-8">
                    <div className="w-16 h-16 bg-green-100 rounded-full mx-auto flex items-center justify-center mb-4">
                        <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                    </div>
                    <h3 className="text-2xl font-bold text-green-700">Booking Confirmed!</h3>
                    <p className="text-gray-600 mt-2">Your amazing trip is booked. Your itinerary and tickets have been sent to your email.</p>
                    <button onClick={onClose} className="mt-6 w-full bg-brand-primary text-white font-bold py-2 px-4 rounded-lg hover:bg-brand-dark transition-colors">
                        Done
                    </button>
                </div>
            );
        case 'FORM':
        default:
            return (
                <form onSubmit={handlePay}>
                    <div className="p-6">
                      <h3 className="text-2xl font-semibold text-gray-800 mb-4">Confirm Your Booking</h3>
                      <p className="text-gray-600 mb-6">You are about to book your entire trip. Please enter your payment details below.</p>
                      
                      <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="card-number">Card Number</label>
                        <input id="card-number" type="text" placeholder="**** **** **** 1234" required className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-brand-secondary focus:border-brand-secondary" />
                      </div>
                      <div className="grid grid-cols-3 gap-4 mb-6">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="expiry">Expiry</label>
                          <input id="expiry" type="text" placeholder="MM/YY" required className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-brand-secondary focus:border-brand-secondary" />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="cvc">CVC</label>
                          <input id="cvc" type="text" placeholder="123" required className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-brand-secondary focus:border-brand-secondary" />
                        </div>
                         <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="zip">ZIP</label>
                          <input id="zip" type="text" placeholder="110001" required className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-brand-secondary focus:border-brand-secondary" />
                        </div>
                      </div>
                    </div>
                    <div className="bg-gray-50 px-6 py-4 flex justify-between items-center rounded-b-lg">
                      <div>
                        <span className="text-sm text-gray-600">Total Amount:</span>
                        <p className="font-bold text-xl text-brand-dark">{formatCurrency(totalCost)}</p>
                      </div>
                      <button type="submit" className="bg-green-600 text-white font-bold py-2 px-6 rounded-lg hover:bg-green-700 transition-colors">
                          Pay Now
                      </button>
                    </div>
                </form>
            );
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 animate-fade-in">
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-md relative">
        {bookingState === 'FORM' && (
          <button onClick={onClose} className="absolute top-3 right-3 text-gray-400 hover:text-gray-600">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
          </button>
        )}
        {renderContent()}
      </div>
    </div>
  );
};
// --- END OF BookingModal.tsx ---

// --- START OF ItineraryDisplay.tsx ---
interface ItineraryDisplayProps {
  itinerary: ItineraryPlan;
  onReset: () => void;
}

const ItineraryDisplay: React.FC<ItineraryDisplayProps> = ({ itinerary, onReset }) => {
  const [activeDay, setActiveDay] = useState<number>(1);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const currentDayPlan = itinerary.dailyPlans.find(plan => plan.day === activeDay);

  const mapUrl = useMemo(() => {
    if (!currentDayPlan) return '';
    
    const locations = [
      currentDayPlan.accommodation.location,
      ...currentDayPlan.activities.map(a => a.location)
    ].filter(loc => loc && loc.trim() !== '');
    
    if (locations.length === 0) {
      const tripLocationMatch = itinerary.tripTitle.match(/to\s(.+)/);
      const fallbackLocation = tripLocationMatch ? tripLocationMatch[1] : 'India';
      return `https://maps.google.com/maps?q=${encodeURIComponent(fallbackLocation)}&t=&z=10&ie=UTF8&iwloc=&output=embed`;
    }
    
    const query = locations.map(loc => `(${encodeURIComponent(loc)})`).join('+OR+');
    return `https://maps.google.com/maps?q=${query}&t=&z=12&ie=UTF8&iwloc=&output=embed`;
  }, [currentDayPlan, itinerary.tripTitle]);

  return (
    <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-lg animate-slide-in-up space-y-8">
      <div className="text-center">
        <h2 className="text-3xl sm:text-4xl font-extrabold text-brand-dark tracking-tight">{itinerary.tripTitle}</h2>
        <p className="mt-2 text-lg text-gray-600">
          Total Estimated Cost: 
          <span className="font-bold text-brand-primary"> {formatCurrency(itinerary.totalEstimatedCost)}</span>
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
        <div className="p-4 bg-blue-50 border-l-4 border-blue-400 rounded-r-lg">
            <h4 className="flex items-center text-lg font-semibold text-blue-800 mb-2"><PlaneIcon className="w-5 h-5 mr-2" /> Flight Details</h4>
            <p><strong>{itinerary.flightDetails.airline} ({itinerary.flightDetails.flightNumber})</strong></p>
            <p>{itinerary.flightDetails.departureAirport} → {itinerary.flightDetails.arrivalAirport}</p>
            <p><strong>Departs:</strong> {new Date(itinerary.flightDetails.departureTime).toLocaleString()}</p>
            <p><strong>Arrives:</strong> {new Date(itinerary.flightDetails.arrivalTime).toLocaleString()}</p>
            <p className="font-bold mt-1">Cost: {formatCurrency(itinerary.flightDetails.estimatedCost)}</p>
        </div>
         <div className="p-4 bg-yellow-50 border-l-4 border-yellow-400 rounded-r-lg">
            <h4 className="flex items-center text-lg font-semibold text-yellow-800 mb-2"><WeatherIcon className="w-5 h-5 mr-2" /> Weather Forecast</h4>
            <p className="italic">"{itinerary.weatherForecast.summary}"</p>
            <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2">
                {itinerary.weatherForecast.daily.map(day => (
                    <div key={day.day}><strong>Day {day.day}:</strong> {day.lowTemp}°C / {day.highTemp}°C, {day.description}</div>
                ))}
            </div>
        </div>
      </div>

      <div className="border-b pb-6">
        <div className="flex flex-wrap justify-center gap-2">
          {itinerary.dailyPlans.map((plan) => (
            <button
              key={plan.day}
              onClick={() => setActiveDay(plan.day)}
              className={`px-4 py-2 rounded-full text-sm font-semibold transition-all duration-200 ${
                activeDay === plan.day
                  ? 'bg-brand-primary text-white shadow'
                  : 'bg-gray-100 text-gray-700 hover:bg-brand-light'
              }`}
            >
              Day {plan.day}
            </button>
          ))}
        </div>
      </div>
      
      {currentDayPlan && (
        <div className="animate-fade-in grid grid-cols-1 lg:grid-cols-5 gap-8">
            <div className="lg:col-span-3 space-y-6">
                <h3 className="text-2xl font-bold text-center lg:text-left text-gray-800">{currentDayPlan.title}</h3>
                
                <div className="space-y-4">
                    <div className="p-4 border-l-4 border-brand-secondary bg-brand-light rounded-r-lg">
                        <h4 className="flex items-center text-lg font-semibold text-brand-dark mb-2"><ActivityIcon className="w-5 h-5 mr-2" /> Activities</h4>
                        <ul className="list-disc list-inside space-y-3 text-gray-700">
                            {currentDayPlan.activities.map((activity, index) => (
                                <li key={index}>
                                    <strong>{activity.time}:</strong> {activity.description} ({formatCurrency(activity.estimatedCost)})
                                    <a href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(activity.location)}`} target="_blank" rel="noopener noreferrer" className="block text-sm text-blue-600 hover:underline pl-6">
                                        📍 {activity.location}
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </div>
                    
                     <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                         <div className="p-4 bg-gray-50 rounded-lg">
                             <h4 className="flex items-center text-md font-semibold text-gray-800 mb-2"><BedIcon className="w-5 h-5 mr-2" /> Accommodation</h4>
                             <p className="text-sm text-gray-700"><strong>{currentDayPlan.accommodation.name}:</strong> {currentDayPlan.accommodation.description} ({formatCurrency(currentDayPlan.accommodation.estimatedCost)})</p>
                             <a href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(currentDayPlan.accommodation.location)}`} target="_blank" rel="noopener noreferrer" className="block text-xs text-blue-600 hover:underline mt-1">
                                📍 {currentDayPlan.accommodation.location}
                             </a>
                         </div>
                         <div className="p-4 bg-gray-50 rounded-lg">
                             <h4 className="flex items-center text-md font-semibold text-gray-800 mb-2"><TransportIcon className="w-5 h-5 mr-2" /> Transport</h4>
                             <p className="text-sm text-gray-700"><strong>{currentDayPlan.transport.mode}:</strong> {currentDayPlan.transport.description} ({formatCurrency(currentDayPlan.transport.estimatedCost)})</p>
                         </div>
                         <div className="p-4 bg-gray-50 rounded-lg">
                             <h4 className="flex items-center text-md font-semibold text-gray-800 mb-2"><FoodIcon className="w-5 h-5 mr-2" /> Food</h4>
                             <p className="text-sm text-gray-700">{currentDayPlan.food.description} ({formatCurrency(currentDayPlan.food.estimatedCost)})</p>
                         </div>
                     </div>
                </div>
            </div>
             <div className="lg:col-span-2">
                <div className="sticky top-8">
                    <h4 className="flex items-center text-xl font-semibold text-gray-800 mb-4"><MapIcon className="w-6 h-6 mr-2" /> Day {currentDayPlan.day} Map View</h4>
                    <div className="h-80 md:h-96 lg:h-[450px] bg-gray-200 rounded-2xl overflow-hidden shadow-lg border animate-fade-in">
                        <iframe
                            key={mapUrl}
                            src={mapUrl}
                            width="100%"
                            height="100%"
                            style={{ border: 0 }}
                            allowFullScreen={false}
                            loading="lazy"
                            referrerPolicy="no-referrer-when-downgrade"
                            title={`Map for Day ${currentDayPlan.day}`}
                        ></iframe>
                    </div>
                    <p className="text-xs text-gray-500 mt-2 text-center">Map shows approximate locations for today's plan.</p>
                </div>
             </div>
        </div>
      )}

      <div className="mt-4 flex flex-col sm:flex-row justify-center items-center gap-4">
        <button
          onClick={() => setIsBookingModalOpen(true)}
          className="w-full sm:w-auto bg-green-600 text-white font-bold py-3 px-8 rounded-lg hover:bg-green-700 transition-transform transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
        >
          Book Now
        </button>
        <button
          onClick={onReset}
          className="w-full sm:w-auto bg-gray-200 text-gray-800 font-bold py-3 px-8 rounded-lg hover:bg-gray-300 transition-colors"
        >
          Plan Another Trip
        </button>
      </div>

      <BookingModal
        isOpen={isBookingModalOpen}
        onClose={() => setIsBookingModalOpen(false)}
        totalCost={itinerary.totalEstimatedCost}
      />
    </div>
  );
};
// --- END OF ItineraryDisplay.tsx ---

// --- START OF App.tsx ---
const App: React.FC = () => {
  const [preferences, setPreferences] = useState<TripPreferences | null>(null);
  const [itinerary, setItinerary] = useState<ItineraryPlan | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleFormSubmit = useCallback(async (prefs: TripPreferences) => {
    setIsLoading(true);
    setError(null);
    setItinerary(null);
    setPreferences(prefs);
    try {
      const plan = await generateItinerary(prefs);
      setItinerary(plan);
    } catch (err) {
      console.error(err);
      setError('Failed to generate itinerary. The AI might be busy, or the request was invalid. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleReset = () => {
    setPreferences(null);
    setItinerary(null);
    setError(null);
    setIsLoading(false);
  };

  const renderContent = () => {
    if (isLoading) {
      return <LoadingSpinner preferences={preferences} />;
    }
    if (error) {
      return (
        <div className="text-center p-8 bg-red-100 border border-red-400 text-red-700 rounded-lg animate-fade-in">
          <h2 className="text-xl font-bold mb-4">An Error Occurred</h2>
          <p>{error}</p>
          <button
            onClick={handleReset}
            className="mt-6 bg-brand-primary text-white font-bold py-2 px-6 rounded-lg hover:bg-brand-dark transition-colors"
          >
            Start Over
          </button>
        </div>
      );
    }
    if (itinerary) {
      return <ItineraryDisplay itinerary={itinerary} onReset={handleReset} />;
    }
    return <TripForm onSubmit={handleFormSubmit} />;
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-800">
      <header className="bg-brand-primary shadow-md">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <SparklesIcon className="w-8 h-8 text-white" />
            <h1 className="text-2xl font-bold text-white tracking-tight">
              Personalized AI Trip Planner
            </h1>
          </div>
        </div>
      </header>
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="max-w-4xl mx-auto">
          {renderContent()}
        </div>
      </main>
      <footer className="text-center py-4 text-sm text-gray-500">
        <p>Powered by Google Gemini AI</p>
      </footer>
    </div>
  );
};
// --- END OF App.tsx ---

// --- FINAL RENDER ---
const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
