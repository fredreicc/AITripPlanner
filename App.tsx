
import React, { useState, useCallback } from 'react';
import { TripForm } from './components/TripForm';
import { ItineraryDisplay } from './components/ItineraryDisplay';
import { LoadingSpinner } from './components/LoadingSpinner';
import { generateItinerary } from './services/geminiService';
import type { ItineraryPlan, TripPreferences } from './types';
import { SparklesIcon } from './components/icons/SparklesIcon';

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

export default App;
