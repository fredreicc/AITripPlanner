import React from 'react';
import { TripPreferences } from '../types';

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

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ preferences }) => {
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
