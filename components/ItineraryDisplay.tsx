import React, { useState, useMemo } from 'react';
import type { ItineraryPlan } from '../types';
import { BookingModal } from './BookingModal';
import { ActivityIcon } from './icons/ActivityIcon';
import { BedIcon } from './icons/BedIcon';
import { TransportIcon } from './icons/TransportIcon';
import { FoodIcon } from './icons/FoodIcon';
import { MapIcon } from './icons/MapIcon';
import { PlaneIcon } from './icons/PlaneIcon';
import { WeatherIcon } from './icons/WeatherIcon';

interface ItineraryDisplayProps {
  itinerary: ItineraryPlan;
  onReset: () => void;
}

export const ItineraryDisplay: React.FC<ItineraryDisplayProps> = ({ itinerary, onReset }) => {
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
