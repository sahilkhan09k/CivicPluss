import { useEffect, useState } from 'react';

const TestMap = () => {
    const [error, setError] = useState(null);
    const [apiKey, setApiKey] = useState('');

    useEffect(() => {
        const key = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
        setApiKey(key);

        if (!key || key === 'YOUR_GOOGLE_MAPS_API_KEY_HERE') {
            setError('API key not configured in .env file');
            return;
        }

        const script = document.createElement('script');
        script.src = `https://maps.googleapis.com/maps/api/js?key=${key}&libraries=visualization,places`;
        script.async = true;
        script.defer = true;

        script.onload = () => {
            console.log('✅ Google Maps loaded successfully!');
            setError(null);

            try {
                const map = new window.google.maps.Map(document.getElementById('test-map'), {
                    center: { lat: 19.0760, lng: 72.8777 },
                    zoom: 12
                });
                console.log('✅ Map created successfully!');
            } catch (err) {
                console.error('❌ Error creating map:', err);
                setError(`Map creation error: ${err.message}`);
            }
        };

        script.onerror = (err) => {
            console.error('❌ Error loading Google Maps script:', err);
            setError('Failed to load Google Maps script. Check your API key and internet connection.');
        };

        document.head.appendChild(script);

        return () => {

            const existingScript = document.querySelector(`script[src*="maps.googleapis.com"]`);
            if (existingScript) {
                existingScript.remove();
            }
        };
    }, []);

    return (
        <div className="min-h-screen bg-gray-50 p-8">
            <div className="max-w-4xl mx-auto">
                <h1 className="text-3xl font-bold mb-6">Google Maps Test Page</h1>

                <div className="card mb-6">
                    <h2 className="text-xl font-semibold mb-4">Configuration Check</h2>
                    <div className="space-y-2">
                        <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
                            <span className="font-medium">API Key Status:</span>
                            <span className={`px-3 py-1 rounded text-sm ${apiKey && apiKey !== 'YOUR_GOOGLE_MAPS_API_KEY_HERE'
                                    ? 'bg-green-100 text-green-700'
                                    : 'bg-red-100 text-red-700'
                                }`}>
                                {apiKey && apiKey !== 'YOUR_GOOGLE_MAPS_API_KEY_HERE' ? 'Configured' : 'Not Configured'}
                            </span>
                        </div>
                        <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
                            <span className="font-medium">API Key:</span>
                            <code className="text-sm bg-gray-200 px-2 py-1 rounded">
                                {apiKey ? `${apiKey.substring(0, 20)}...` : 'Not found'}
                            </code>
                        </div>
                    </div>
                </div>

                {error && (
                    <div className="card bg-red-50 border-2 border-red-200 mb-6">
                        <h3 className="font-semibold text-red-900 mb-2">Error</h3>
                        <p className="text-red-700">{error}</p>
                    </div>
                )}

                <div className="card mb-6">
                    <h2 className="text-xl font-semibold mb-4">Troubleshooting Steps</h2>
                    <ol className="list-decimal list-inside space-y-2 text-gray-700">
                        <li>Go to <a href="https://console.cloud.google.com/" target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">Google Cloud Console</a></li>
                        <li>Create a new project or select existing one</li>
                        <li>Enable "Maps JavaScript API" in APIs & Services</li>
                        <li>Create an API key in Credentials</li>
                        <li>Copy the API key</li>
                        <li>Update <code className="bg-gray-200 px-2 py-1 rounded">client/.env</code> file</li>
                        <li>Restart the dev server (<code className="bg-gray-200 px-2 py-1 rounded">npm run dev</code>)</li>
                        <li>Enable billing (required, but $200 free credit/month)</li>
                    </ol>
                </div>

                <div className="card">
                    <h2 className="text-xl font-semibold mb-4">Test Map</h2>
                    <div
                        id="test-map"
                        className="w-full h-96 bg-gray-200 rounded-lg flex items-center justify-center"
                    >
                        <p className="text-gray-600">Loading map...</p>
                    </div>
                </div>

                <div className="card mt-6 bg-blue-50 border-2 border-blue-200">
                    <h3 className="font-semibold text-blue-900 mb-2">Common Issues</h3>
                    <ul className="text-sm text-blue-800 space-y-1">
                        <li>• <strong>API key not valid:</strong> Check if key is correct in .env</li>
                        <li>• <strong>Billing not enabled:</strong> Enable billing in Google Cloud Console</li>
                        <li>• <strong>API not enabled:</strong> Enable "Maps JavaScript API"</li>
                        <li>• <strong>Referrer restrictions:</strong> Add http://localhost:5173/* to allowed referrers</li>
                        <li>• <strong>Quota exceeded:</strong> Check usage in Google Cloud Console</li>
                    </ul>
                </div>
            </div>
        </div>
    );
};

export default TestMap;
