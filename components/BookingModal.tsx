import React, { useState, useEffect } from 'react';

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  totalCost: number;
}

type BookingState = 'FORM' | 'PROCESSING' | 'CONFIRMED';

export const BookingModal: React.FC<BookingModalProps> = ({ isOpen, onClose, totalCost }) => {
  const [bookingState, setBookingState] = useState<BookingState>('FORM');

  useEffect(() => {
    if (isOpen) {
      setBookingState('FORM');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handlePay = (e: React.FormEvent) => {
    e.preventDefault();
    setBookingState('PROCESSING');
    setTimeout(() => {
      setBookingState('CONFIRMED');
    }, 2000);
  };
  
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
    }).format(amount);
  };

  const renderContent = () => {
    switch(bookingState) {
        case 'PROCESSING':
            return (
                <div className="text-center p-8">
                    <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
                    <h3 className="text-xl font-semibold mt-4">Processing Payment...</h3>
                    <p className="text-gray-600 mt-2">Securely contacting booking partners.</p>
                </div>
            );
        case 'CONFIRMED':
            return (
                <div className="text-center p-8">
                    <div className="w-16 h-16 bg-green-100 rounded-full mx-auto flex items-center justify-center mb-4">
                        <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                    </div>
                    <h3 className="text-2xl font-bold text-green-700">Booking Confirmed!</h3>
                    <p className="text-gray-600 mt-2">Your amazing trip is booked. Your itinerary and tickets have been sent to your email.</p>
                    <button onClick={onClose} className="mt-6 w-full bg-brand-primary text-white font-bold py-2 px-4 rounded-lg hover:bg-brand-dark transition-colors">
                        Done
                    </button>
                </div>
            );
        case 'FORM':
        default:
            return (
                <form onSubmit={handlePay}>
                    <div className="p-6">
                      <h3 className="text-2xl font-semibold text-gray-800 mb-4">Confirm Your Booking</h3>
                      <p className="text-gray-600 mb-6">You are about to book your entire trip. Please enter your payment details below.</p>
                      
                      <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="card-number">Card Number</label>
                        <input id="card-number" type="text" placeholder="**** **** **** 1234" required className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-brand-secondary focus:border-brand-secondary" />
                      </div>
                      <div className="grid grid-cols-3 gap-4 mb-6">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="expiry">Expiry</label>
                          <input id="expiry" type="text" placeholder="MM/YY" required className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-brand-secondary focus:border-brand-secondary" />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="cvc">CVC</label>
                          <input id="cvc" type="text" placeholder="123" required className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-brand-secondary focus:border-brand-secondary" />
                        </div>
                         <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="zip">ZIP</label>
                          <input id="zip" type="text" placeholder="110001" required className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-brand-secondary focus:border-brand-secondary" />
                        </div>
                      </div>
                    </div>
                    <div className="bg-gray-50 px-6 py-4 flex justify-between items-center rounded-b-lg">
                      <div>
                        <span className="text-sm text-gray-600">Total Amount:</span>
                        <p className="font-bold text-xl text-brand-dark">{formatCurrency(totalCost)}</p>
                      </div>
                      <button type="submit" className="bg-green-600 text-white font-bold py-2 px-6 rounded-lg hover:bg-green-700 transition-colors">
                          Pay Now
                      </button>
                    </div>
                </form>
            );
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 animate-fade-in">
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-md relative">
        {bookingState === 'FORM' && (
          <button onClick={onClose} className="absolute top-3 right-3 text-gray-400 hover:text-gray-600">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
          </button>
        )}
        {renderContent()}
      </div>
    </div>
  );
};
