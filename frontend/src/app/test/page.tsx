'use client';

import { useState } from 'react';
import { healthService } from '@/lib/api';

export default function TestPage() {
  const [status, setStatus] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');

  const testConnection = async () => {
    setLoading(true);
    setError('');
    setStatus('');

    try {
      const result = await healthService.check();
      setStatus(`✅ Connexion réussie ! Message: ${result.message}`);
      console.log('Health check result:', result);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur inconnue';
      setError(`❌ Erreur de connexion: ${errorMessage}`);
      console.error('Health check error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-md mx-auto bg-white rounded-lg shadow-md p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-6 text-center">
          🔧 Test de Connexion API
        </h1>
        
        <div className="space-y-4">
          <button
            onClick={testConnection}
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 
                     text-white font-medium py-2 px-4 rounded-md transition-colors"
          >
            {loading ? '⏳ Test en cours...' : '🚀 Tester la Connexion'}
          </button>

          {status && (
            <div className="p-3 bg-green-50 border border-green-200 rounded-md">
              <p className="text-green-800 text-sm">{status}</p>
            </div>
          )}

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-md">
              <p className="text-red-800 text-sm">{error}</p>
            </div>
          )}

          <div className="mt-6 p-4 bg-gray-50 rounded-md">
            <h3 className="font-medium text-gray-900 mb-2">Configuration:</h3>
            <p className="text-sm text-gray-600">
              <strong>Environnement:</strong> {process.env.NODE_ENV}
            </p>
            <p className="text-sm text-gray-600">
              <strong>API URL:</strong> {process.env.NODE_ENV === 'development' 
                ? 'http://localhost:3000' 
                : 'https://smart-lock-saas.vercel.app'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}