import React from 'react';
import { useNavigate } from 'react-router-dom';

export const PaymentPage: React.FC = () => {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen flex items-center justify-center bg-green-50 p-6">
      <div className="bg-white shadow-lg rounded-xl p-8 max-w-md w-full">
        <h2 className="text-xl font-bold mb-4">Payment Gateway</h2>
        <p className="text-sm text-gray-600 mb-6">This is a dummy payment page. Click below to simulate payment success.</p>
        <button
          onClick={() => navigate('/payment-success')}
          className="bg-green-600 text-white w-full py-2 rounded-lg shadow hover:bg-green-700"
        >
          Pay ₹999
        </button>
      </div>
    </div>
  );
};
