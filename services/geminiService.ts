import { GoogleGenAI, Type } from '@google/genai';
import type { ItineraryPlan, TripPreferences } from '../types';

if (!process.env.API_KEY) {
    throw new Error("API_KEY environment variable not set");
}

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


export const generateItinerary = async (prefs: TripPreferences): Promise<ItineraryPlan> => {
  const duration = Math.ceil((new Date(prefs.endDate).getTime() - new Date(prefs.startDate).getTime()) / (1000 * 3600 * 24));

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
