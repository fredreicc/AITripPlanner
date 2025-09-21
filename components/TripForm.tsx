import React, { useState } from 'react';
import { TripPreferences } from '../types';
import { MapPinIcon } from './icons/MapPinIcon';
import { CalendarIcon } from './icons/CalendarIcon';
import { CurrencyRupeeIcon } from './icons/CurrencyRupeeIcon';
import { UsersIcon } from './icons/UsersIcon';

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

export const TripForm: React.FC<TripFormProps> = ({ onSubmit }) => {
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
