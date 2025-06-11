'use client';

import { useEffect } from 'react';

interface GlobalErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function GlobalError({ error, reset }: GlobalErrorProps) {
  useEffect(() => {
    console.error('Global application error:', error);
  }, [error]);

  return (
    <html>
      <body className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <div className="max-w-md w-full text-center">
          <div className="mb-8">
            <div className="text-6xl mb-4">⚠️</div>
            <h1 className="text-3xl font-bold mb-4 text-gray-900">Critical Error</h1>
            <p className="text-lg text-gray-600 mb-2">
              Something went seriously wrong with the application.
            </p>
            <p className="text-sm text-gray-500">
              We apologize for the inconvenience.
            </p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-lg">
            <h2 className="text-xl font-semibold mb-4">What can you do?</h2>
            <div className="space-y-3">
              <button 
                onClick={reset}
                className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
              >
                Try Again
              </button>
              
              <button 
                onClick={() => window.location.href = '/'}
                className="w-full bg-gray-200 text-gray-800 py-2 px-4 rounded-md hover:bg-gray-300 transition-colors"
              >
                Go to Homepage
              </button>
            </div>
          </div>
          
          <div className="mt-6 text-sm text-gray-500">
            <p>Error ID: {error.digest || 'Unknown'}</p>
            <p>If this problem persists, please contact support.</p>
          </div>
        </div>
      </body>
    </html>
  );
}
