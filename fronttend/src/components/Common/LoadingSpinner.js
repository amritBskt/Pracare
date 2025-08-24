import React from 'react';
import { Heart } from 'lucide-react';

const LoadingSpinner = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
      <div className="text-center">
        <div className="relative">
          <Heart className="h-16 w-16 text-indigo-600 mx-auto animate-pulse" />
          <div className="absolute inset-0 h-16 w-16 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mx-auto"></div>
        </div>
        <h2 className="mt-6 text-xl font-semibold text-gray-900">Loading Pracare...</h2>
        <p className="mt-2 text-sm text-gray-600">Please wait while we prepare your mental health companion</p>
      </div>
    </div>
  );
};

export default LoadingSpinner;
