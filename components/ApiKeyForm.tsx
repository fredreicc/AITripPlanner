import React, { useState } from 'react';
import { KeyIcon } from './icons/KeyIcon';

interface ApiKeyFormProps {
    onApiKeySubmit: (apiKey: string) => void;
}

export const ApiKeyForm: React.FC<ApiKeyFormProps> = ({ onApiKeySubmit }) => {
    const [apiKey, setApiKey] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (apiKey) {
            onApiKeySubmit(apiKey);
        }
    };

    return (
        <div className="bg-white p-8 rounded-2xl shadow-lg animate-fade-in text-center">
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Service Configuration</h2>
            <p className="text-gray-600 mb-6">Please provide your Google Gemini API key to activate the planner.</p>
            <form onSubmit={handleSubmit} className="flex flex-col items-center gap-4">
                <div className="relative w-full max-w-sm">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                        <KeyIcon className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                        type="password"
                        value={apiKey}
                        onChange={(e) => setApiKey(e.target.value)}
                        placeholder="Enter your API Key"
                        required
                        className="w-full pl-10 pr-4 py-2 bg-white border border-gray-300 rounded-lg focus:ring-brand-secondary focus:border-brand-secondary"
                    />
                </div>
                <button
                    type="submit"
                    className="w-full max-w-sm bg-brand-primary text-white font-bold py-2.5 px-4 rounded-lg hover:bg-brand-dark transition-transform transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-primary"
                >
                    Start Planning
                </button>
            </form>
            <p className="text-xs text-gray-500 mt-4">
                Your API key is used for this session only and is not stored.
            </p>
        </div>
    );
};
