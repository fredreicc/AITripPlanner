// src/App.tsx
import React, { useState, useCallback, useMemo } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { GoogleGenAI } from '@google/genai';
import { TripPreferences, ItineraryPlan } from './types';
import { generateItinerary } from './services/geminiService';
import { TripForm } from './components/TripForm';
import { ItineraryDisplay } from './components/ItineraryDisplay';
import { LoadingSpinner } from './components/LoadingSpinner';
import { SparklesIcon } from './components/icons/SparklesIcon';
import { KeyIcon } from './components/icons/KeyIcon';
import { PaymentPage } from './pages/PaymentPage';
import { PaymentSuccess } from './pages/PaymentSuccess';

export const App: React.FC = () => {
  // ---- stable hook order starts here ----
  // 1) initialize aiClient once with useMemo (no other hooks inside)
  const aiClient = useMemo(() => {
    const apiKey = (import.meta.env.VITE_GEMINI_API_KEY as string) || '';

    // DEV-only check (safe): log presence, not the key itself
    if (typeof window !== 'undefined') {
      // eslint-disable-next-line no-console
      console.log('GEMINI KEY loaded?', Boolean(apiKey));
    }

    try {
      if (!apiKey) {
        throw new Error('API key is missing.');
      }
      return new GoogleGenAI({ apiKey });
    } catch (e) {
      console.error('Failed to initialize GoogleGenAI:', e);
      return null;
    }
  }, []);
  // ---- end useMemo ----

  // 2) top-level state hooks (always same order)
  const [preferences, setPreferences] = useState<TripPreferences | null>(null);
  const [itinerary, setItinerary] = useState<ItineraryPlan | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // 3) stable callbacks
  const handleFormSubmit = useCallback(
    async (prefs: TripPreferences) => {
      if (!aiClient) {
        setError('AI Service is not configured correctly. Please check the API key.');
        return;
      }
      setIsLoading(true);
      setError(null);
      setItinerary(null);
      setPreferences(prefs);
      try {
        const plan = await generateItinerary(aiClient, prefs);
        setItinerary(plan);
      } catch (err) {
        console.error(err);
        setError('Failed to generate itinerary. The AI might be busy, or the request was invalid. Please try again.');
      } finally {
        setIsLoading(false);
      }
    },
    [aiClient]
  );

  const handleReset = useCallback(() => {
    setPreferences(null);
    setItinerary(null);
    setError(null);
    setIsLoading(false);
  }, []);

  // This renders the main content (used by the Home route)
  const renderHomeContent = () => {
    if (!aiClient) {
      return (
        <div className="bg-white p-8 rounded-2xl shadow-lg animate-fade-in text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full mx-auto flex items-center justify-center mb-4">
            <KeyIcon className="w-8 h-8 text-red-600" />
          </div>
          <h2 className="text-2xl font-bold text-red-700">Service Not Configured</h2>
          <p className="text-gray-600 mt-2">The Google Gemini API key is missing or invalid.</p>
          <p className="text-gray-500 text-sm mt-1">Please ensure it is correctly set up in your environment variables.</p>
        </div>
      );
    }

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

  // App shell (header/footer) kept outside routes so they show on all pages
  const AppShell: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-800">
      <header className="bg-green-600 shadow-md">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <SparklesIcon className="w-8 h-8 text-white" />
            <h1 className="text-2xl font-bold text-white tracking-tight">Personalized AI Trip Planner</h1>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="max-w-7xl mx-auto">{children}</div>
      </main>

      <footer className="text-center py-4 text-sm text-gray-500">
        <p>Powered by Google Gemini AI</p>
      </footer>
    </div>
  );

  return (
    <BrowserRouter>
      <AppShell>
        <Routes>
          <Route path="/" element={renderHomeContent()} />

          {/* Payment flow */}
          <Route
            path="/payment"
            element={<PaymentPage />}
          />
          <Route
            path="/payment-success"
            element={<PaymentSuccess />}
          />

          {/* fallback: redirect unknown routes to home */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AppShell>
    </BrowserRouter>
  );
};

export default App;
