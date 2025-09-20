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
