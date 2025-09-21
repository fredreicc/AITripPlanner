import React from 'react';
import { useNavigate } from 'react-router-dom';

export const PaymentSuccess: React.FC = () => {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen flex items-center justify-center bg-green-50 p-6">
      <div className="bg-white shadow-lg rounded-xl p-8 max-w-md w-full text-center">
        <h2 className="text-xl font-bold mb-4 text-green-700">✅ Payment Successful</h2>
        <p className="text-sm text-gray-600 mb-6">Thank you! Your booking has been confirmed.</p>
        <button
          onClick={() => navigate('/')}
          className="bg-green-600 text-white px-6 py-2 rounded-lg shadow hover:bg-green-700"
        >
          Back to Home
        </button>
      </div>
    </div>
  );
};
